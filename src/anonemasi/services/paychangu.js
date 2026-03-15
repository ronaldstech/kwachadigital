// PayChangu Mobile Money Payment Service
// Operator detection + transaction logging + payment verification

import { auth, db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, query, where, getDocs, orderBy, getDoc, increment } from 'firebase/firestore';

const PAYCHANGU_BASE_URL = 'https://api.paychangu.com';

// ─── Operator config ──────────────────────────────────────────────────────────
// Static fallback config (name, prefix detection only — ref_id is fetched live)
const OPERATOR_PREFIXES = {
    airtel: {
        name: 'Airtel Money',
        prefixes: ['099', '098', '097', '096', '095', '094', '093', '092', '091', '090']
    },
    tnm: {
        name: 'TNM Mpamba',
        prefixes: ['088', '087', '086', '085', '084', '083', '082', '081', '080', '089']
    }
};

// In-memory cache: { airtel: { name, ref_id }, tnm: { name, ref_id } }
let _operatorCache = null;

/**
 * Fetch mobile money operators from PayChangu and cache result.
 * API: GET /mobile-money (no auth needed)
 * Response items expected to have: ref_id, name (e.g. "Airtel Money", "TNM Mpamba")
 * @returns {Promise<{ airtel: {name, ref_id}, tnm: {name, ref_id} }>}
 */
export async function fetchOperators() {
    if (_operatorCache) return _operatorCache;

    try {
        const res = await fetch(`${PAYCHANGU_BASE_URL}/mobile-money`, {
            method: 'GET',
            headers: { accept: 'application/json' }
        });
        const data = await res.json();

        // The response is expected to be an array or contain a data array of operators
        const list = Array.isArray(data) ? data : (data?.data || []);

        const cache = {};
        for (const op of list) {
            const nameLower = (op.name || '').toLowerCase();
            if (nameLower.includes('airtel')) {
                cache.airtel = { name: op.name, ref_id: op.ref_id || op.id };
            } else if (nameLower.includes('tnm') || nameLower.includes('mpamba')) {
                cache.tnm = { name: op.name, ref_id: op.ref_id || op.id };
            }
        }

        // Merge with prefix config for detection
        _operatorCache = {
            airtel: { ...OPERATOR_PREFIXES.airtel, ...cache.airtel },
            tnm: { ...OPERATOR_PREFIXES.tnm, ...cache.tnm }
        };

        console.log('[PayChangu] Operators loaded:', _operatorCache);
        return _operatorCache;
    } catch (err) {
        console.warn('[PayChangu] Failed to fetch operators, using fallback:', err.message);
        // Return prefixes-only fallback (no ref_id — will cause payment to fail gracefully)
        return OPERATOR_PREFIXES;
    }
}

/**
 * Exported OPERATORS getter — resolves lazily from cache.
 * Use fetchOperators() for async contexts; this is for sync reads after cache is warm.
 */
export function getOperators() {
    return _operatorCache || OPERATOR_PREFIXES;
}

// Keep a named export for the modal UI to import
export const OPERATORS = OPERATOR_PREFIXES; // prefix/name info (ref_id added after fetch)

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 20; // ~80 seconds total

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Generate a unique numeric-only charge ID.
 * Format: timestamp (13 digits) + 6 random digits = 19 digits total
 */
export function generateChargeId() {
    const ts = Date.now().toString(); // 13 digits
    const rand = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    return ts + rand; // 19 numeric digits
}

/**
 * Detect Malawian mobile money operator from a phone number.
 */
export function detectOperator(phone) {
    if (!phone || phone.length < 3) return null;
    const normalized = phone.replace(/\s+/g, '').replace(/^\+265/, '0');
    const prefix3 = normalized.substring(0, 3);
    for (const [key, info] of Object.entries(OPERATORS)) {
        if (info.prefixes.includes(prefix3)) return { operator: key, info };
    }
    if (normalized.startsWith('09')) return { operator: 'airtel', info: OPERATORS.airtel };
    if (normalized.startsWith('08')) return { operator: 'tnm', info: OPERATORS.tnm };
    return null;
}

/**
 * Normalize phone to local Malawian format (strip +265).
 */
export function normalizePhone(phone) {
    return phone.replace(/\s+/g, '').replace(/^\+265/, '0');
}

// ─── Firestore helpers ─────────────────────────────────────────────────────

/**
 * Save a pending transaction to Firestore.
 * @returns {string} Firestore document ID
 */
async function saveTransaction({ chargeId, dissertationId, resourceType, resourceId, userId, phone, operator, email, firstName, lastName, amount }) {
    const docRef = await addDoc(collection(db, 'transactions'), {
        chargeId,
        dissertationId: dissertationId || null,
        resourceType: resourceType || (dissertationId ? 'dissertation' : 'unknown'),
        resourceId: resourceId || dissertationId || null,
        userId,
        phone,
        operator,
        email,
        firstName,
        lastName,
        amount: amount || 10000,
        currency: 'MWK',
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    });
    return docRef.id;
}

/**
 * Update a transaction's status in Firestore.
 */
export async function updateTransactionStatus(transactionDocId, status, rawResponse = null) {
    const ref = doc(db, 'transactions', transactionDocId);
    const update = { status, updatedAt: Timestamp.now() };
    if (rawResponse) update.paychanguResponse = rawResponse;
    await updateDoc(ref, update);
}

/**
 * Fetch all transactions for a specific dissertation, ordered newest first.
 * @param {string} dissertationId
 * @returns {Promise<Array>}
 */
export async function fetchDissertationTransactions(dissertationId) {
    if (!dissertationId) return [];
    try {
        const q = query(
            collection(db, 'transactions'),
            where('dissertationId', '==', dissertationId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.warn('[PayChangu] Failed to fetch transactions:', err.message);
        return [];
    }
}

/**
 * Fetch all transactions for a specific user for PowerPoint generations.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function fetchPowerPointTransactions(userId) {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            where('resourceType', '==', 'powerpoint')
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort client-side to avoid needing a Firestore composite index for this specific query
        return docs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (err) {
        console.warn('[PayChangu] Failed to fetch PowerPoint transactions:', err.message);
        return [];
    }
}

/**
 * Fetch all transactions for a specific user for Essay generations.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function fetchEssayTransactions(userId) {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            where('resourceType', '==', 'essay')
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return docs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (err) {
        console.warn('[PayChangu] Failed to fetch Essay transactions:', err.message);
        return [];
    }
}

// ─── PayChangu API ─────────────────────────────────────────────────────────

/**
 * Call PayChangu verify-payment endpoint (correct URL).
 * URL: GET /mobile-money/payments/{charge_id}/verify
 * @param {string} chargeId
 * @returns {Promise<object>}
 */
export async function verifyPayment(chargeId) {
    const secretKey = import.meta.env.VITE_PAYCHANGU_SECRET_KEY;
    if (!secretKey) throw new Error('PayChangu secret key is not configured.');

    const response = await fetch(`${PAYCHANGU_BASE_URL}/mobile-money/payments/${chargeId}/verify`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${secretKey}`
        }
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Verification failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Re-verify an existing transaction (single check, not polling).
 * Returns { status: 'success'|'failed'|'pending'|'error', message, logs }
 * @param {{ id: string, chargeId: string }} transaction - Firestore doc
 */
export async function reverifyTransaction(transaction) {
    let result;
    try {
        result = await verifyPayment(transaction.chargeId);
    } catch (err) {
        // API returned non-OK HTTP — surface the error message
        return { status: 'error', message: err.message, logs: [] };
    }

    const status = (result?.data?.status || '').toLowerCase();
    // Pull the human-readable message from the outer response field
    const message = result?.message || '';
    // Pull logs array for additional context
    const logs = result?.data?.logs || [];

    if (status === 'success' || status === 'successful' || status === 'completed') {
        await updateTransactionStatus(transaction.id, 'success', result);
        return { status: 'success', message: message || 'Payment confirmed.', logs };
    }
    if (status === 'failed' || status === 'cancelled' || status === 'canceled' || status === 'declined') {
        await updateTransactionStatus(transaction.id, 'failed', result);
        return { status: 'failed', message, logs };
    }

    // still pending
    return { status: 'pending', message: message || 'Payment is still pending.', logs };
}

// ─── Polling ───────────────────────────────────────────────────────────────

async function pollPaymentStatus(chargeId, transactionDocId, onStatusUpdate) {
    for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        onStatusUpdate?.({ attempt, total: POLL_MAX_ATTEMPTS });

        try {
            const result = await verifyPayment(chargeId);
            const status = (result?.data?.status || '').toLowerCase();

            if (status === 'success' || status === 'successful' || status === 'completed') {
                await updateTransactionStatus(transactionDocId, 'success', result);
                
                // If this was a token purchase, add tokens to user balance
                const txnSnap = await getDoc(doc(db, 'transactions', transactionDocId));
                if (txnSnap.exists()) {
                    const txnData = txnSnap.data();
                    if (txnData.resourceType === 'tokens') {
                        const userRef = doc(db, 'users', txnData.userId);
                        await updateDoc(userRef, {
                            tokens: increment(txnData.amount), // 1 MWK = 1 Token
                            updatedAt: Timestamp.now()
                        });
                        console.log(`[PayChangu] Added ${txnData.amount} tokens to user ${txnData.userId}`);
                    }
                }
                
                return 'success';
            }
        } catch (err) {
            console.warn(`[PayChangu] Poll attempt ${attempt} error:`, err.message);
        }
    }

    await updateTransactionStatus(transactionDocId, 'timeout');
    return 'timeout';
}

// ─── Main Flow ─────────────────────────────────────────────────────────────

/**
 * Full payment flow:
 * 1. Initialize with PayChangu
 * 2. Log pending transaction to Firestore
 * 3. Poll for confirmation
 * 4. Returns 'success' | 'failed' | 'timeout'
 */
export async function processPayment({ phone, email, firstName, lastName, operator, dissertationId, resourceType, resourceId, userId, amount, onStatusUpdate }) {
    const secretKey = import.meta.env.VITE_PAYCHANGU_SECRET_KEY;
    if (!secretKey) throw new Error('PayChangu secret key is not configured.');

    // Fetch live operator list to get correct ref_ids
    const operators = await fetchOperators();
    const operatorInfo = operators[operator];
    if (!operatorInfo) throw new Error('Invalid operator specified.');
    if (!operatorInfo.ref_id) throw new Error(`Operator "${operator}" ref_id not found. Check PayChangu operator list.`);

    const normalizedPhone = normalizePhone(phone);
    const chargeId = generateChargeId();

    // 1. Initialize payment
    const initResponse = await fetch(`${PAYCHANGU_BASE_URL}/mobile-money/payments/initialize`, {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${secretKey}`
        },
        body: JSON.stringify({
            mobile_money_operator_ref_id: operatorInfo.ref_id,
            mobile: normalizedPhone,
            email,
            first_name: firstName,
            last_name: lastName,
            amount: (amount || 10000).toString(),
            charge_id: chargeId
        })
    });

    if (!initResponse.ok) {
        const errData = await initResponse.json().catch(() => ({}));
        throw new Error(errData.message || `Payment initialization failed: ${initResponse.status}`);
    }

    const initData = await initResponse.json();
    console.log('[PayChangu] Initialized:', initData);

    // 2. Log to Firestore
    const transactionDocId = await saveTransaction({
        chargeId, dissertationId, resourceType, resourceId, userId,
        phone: normalizedPhone, operator, email, firstName, lastName, amount: amount || 10000
    });

    // 3. Poll
    return pollPaymentStatus(chargeId, transactionDocId, onStatusUpdate);
}

/**
 * Specifically for buying tokens (re-uses processPayment with resourceType='tokens').
 */
export async function processTokenPurchase({ phone, email, firstName, lastName, operator, userId, amount, onStatusUpdate }) {
    return processPayment({
        phone, email, firstName, lastName, operator,
        resourceType: 'tokens',
        resourceId: 'token_purchase',
        userId,
        amount,
        onStatusUpdate
    });
}

