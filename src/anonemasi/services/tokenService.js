import { db } from '../../firebase';
import { doc, getDoc, updateDoc, increment, collection, addDoc, Timestamp, runTransaction } from 'firebase/firestore';

/**
 * Check if a user has sufficient token balance.
 * @param {string} userId 
 * @param {number} requiredAmount 
 * @returns {Promise<boolean>}
 */
export async function hasSufficientBalance(userId, requiredAmount) {
    if (!userId) return false;
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return false;
        
        const userData = userSnap.data();
        const currentTokens = userData.tokens || 0;
        return currentTokens >= requiredAmount;
    } catch (err) {
        console.error('[TokenService] Balance check failed:', err);
        return false;
    }
}

/**
 * Deduct tokens from user balance with a transaction for atomicity.
 * @param {string} userId 
 * @param {number} amount 
 * @param {string} toolName 
 * @returns {Promise<boolean>} Success status
 */
export async function deductTokens(userId, amount, toolName) {
    if (!userId) return false;
    
    const userRef = doc(db, 'users', userId);
    
    try {
        return await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("User does not exist");

            const currentTokens = userDoc.data().tokens || 0;
            if (currentTokens < amount) {
                throw new Error("Insufficient tokens");
            }

            // Deduct tokens
            transaction.update(userRef, {
                tokens: increment(-amount),
                updatedAt: Timestamp.now()
            });

            // Log the usage
            const usageRef = collection(db, 'token_usage');
            const usageDoc = doc(usageRef); // pre-generate doc if needed or just use addDoc outside
            // Note: transaction.set is better inside transaction
            transaction.set(usageDoc, {
                userId,
                amount,
                type: 'usage',
                tool: toolName,
                createdAt: Timestamp.now()
            });

            return true;
        });
    } catch (err) {
        console.error('[TokenService] Deduction failed:', err.message);
        return false;
    }
}

/**
 * Add tokens to user balance (after successful purchase).
 * @param {string} userId 
 * @param {number} amount 
 * @param {string} transactionId 
 */
export async function addTokens(userId, amount, transactionId) {
    if (!userId) return;
    
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, {
            tokens: increment(amount),
            updatedAt: Timestamp.now()
        });
        
        // Log the purchase
        await addDoc(collection(db, 'token_usage'), {
            userId,
            amount,
            type: 'purchase',
            transactionId,
            createdAt: Timestamp.now()
        });
    } catch (err) {
        console.error('[TokenService] Token addition failed:', err);
    }
}
