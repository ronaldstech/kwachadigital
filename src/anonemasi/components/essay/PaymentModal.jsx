import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, CreditCard, Sparkles, ShieldCheck, Zap, Trophy, Phone,
    ArrowLeft, Loader2, AlertCircle, Clock, RefreshCw, History, ChevronRight, Coins
} from 'lucide-react';
import { detectOperator, processPayment, fetchEssayTransactions, reverifyTransaction, OPERATORS, fetchOperators } from '../../../services/paychangu';
import { hasSufficientBalance, deductTokens } from '../../../services/tokenService';

import BuyTokensModal from '../modals/BuyTokensModal';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';

// ── Operator styles ──────────────────────────────────────────────────────────
const OP_STYLE = {
    airtel: {
        bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30',
        badge: 'bg-red-500 text-white', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400'
    },
    tnm: {
        bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30',
        badge: 'bg-blue-600 text-white', dot: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400'
    }
};

const STATUS_STYLE = {
    pending: { label: 'Pending', cls: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    success: { label: 'Paid', cls: 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' },
    failed: { label: 'Failed', cls: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
    timeout: { label: 'Timed out', cls: 'bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400' },
};

const FEATURES = [
    { icon: <Zap size={14} className="text-yellow-500" />, text: 'Instantly Generate Academic Essays' },
    { icon: <ShieldCheck size={14} className="text-green-500" />, text: 'Top-Tier Reference Formatting' },
    { icon: <Check size={14} className="text-indigo-500" />, text: 'Unlimited Word & PDF Downloads' },
    { icon: <Trophy size={14} className="text-purple-500" />, text: 'Avoid AI Detectors Easily' },
];

const HDR = {
    overview: { title: 'Generate Essay', sub: 'Unlock with Tokens' },
    history: { title: 'Payment History', sub: 'Past transactions for your account' },
    payment: { title: 'Mobile Money Payment', sub: 'Airtel Money or TNM Mpamba' },
    processing: { title: 'Verifying Payment…', sub: 'Approve the prompt on your phone' },
    success: { title: '🎉 Unlocked!', sub: 'Your essay will now generate!' },
    failed: { title: 'Payment Declined', sub: 'Transaction was cancelled or declined' },
    timeout: { title: 'Confirmation Timed Out', sub: 'We could not confirm your payment' },
    error: { title: 'Something Went Wrong', sub: 'Please try again' },
};

// ─────────────────────────────────────────────────────────────────────────────

const PaymentModal = ({ isOpen, onClose, onSuccess, userName, userEmail, userId }) => {
    // stack: 'overview' | 'history' | 'payment' | 'processing' | 'success' | 'failed' | 'timeout' | 'error'
    const [step, setStep] = useState('overview');
    const [phone, setPhone] = useState('');
    const [detectedOp, setDetectedOp] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [pollProgress, setPollProgress] = useState({ attempt: 0, total: 20 });
    const [transactions, setTransactions] = useState([]);
    const [loadingHist, setLoadingHist] = useState(false);
    const [verifyingId, setVerifyingId] = useState(null);
    // Per-transaction feedback: { [txnId]: { status, message, logs } }
    const [txnFeedback, setTxnFeedback] = useState({});
    
    // Token specific state
    const [userTokens, setUserTokens] = useState(0);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isDeducting, setIsDeducting] = useState(false);

    // Listen to user token balance in real-time
    useEffect(() => {
        if (!userId) return;
        const unsub = onSnapshot(doc(db, 'users', userId), (doc) => {
            if (doc.exists()) {
                setUserTokens(doc.data().tokens || 0);
            }
        });
        return () => unsub();
    }, [userId]);

    // Load history whenever the history step is shown
    useEffect(() => {
        if (step === 'history' && userId) {
            setLoadingHist(true);
            fetchEssayTransactions(userId)
                .then(setTransactions)
                .finally(() => setLoadingHist(false));
        }
    }, [step, userId]);

    // Pre-load transactions (for overview badge) and warm operator cache on open
    useEffect(() => {
        if (isOpen && userId) {
            fetchEssayTransactions(userId).then(setTransactions);
        }
        if (isOpen) {
            // Warm the cache so ref_ids are ready before payment step
            fetchOperators().catch(() => { });
        }
    }, [isOpen, userId]);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
        setPhone(val);
        setDetectedOp(detectOperator(val));
    };

    const handleTokenPayment = async () => {
        if (userTokens < 2500) {
            setIsBuyModalOpen(true);
            return;
        }

        setIsDeducting(true);
        setErrorMsg('');

        try {
            const success = await deductTokens(userId, 2500, 'Essay Generation');
            if (success) {
                await onSuccess();
                setStep('success');
                setTimeout(() => handleClose(), 3500);
            } else {
                setErrorMsg('Failed to deduct tokens. Please try again.');
                setStep('error');
            }
        } catch (err) {
            setErrorMsg(err.message || 'An unexpected error occurred.');
            setStep('error');
        } finally {
            setIsDeducting(false);
        }
    };

    const handlePayment = async () => {
        if (!detectedOp || phone.length < 10) return;
        setStep('processing');
        setErrorMsg('');
        setPollProgress({ attempt: 0, total: 20 });

        try {
            const parts = (userName || 'User').trim().split(' ');
            const firstName = parts[0] || 'User';
            const lastName = parts.slice(1).join(' ') || '-';

            const result = await processPayment({
                phone, email: userEmail || 'user@example.com',
                firstName, lastName, operator: detectedOp.operator,
                resourceType: 'essay',
                amount: 2500,
                userId: userId || 'unknown',
                onStatusUpdate: ({ attempt, total }) => setPollProgress({ attempt, total })
            });

            if (result === 'success') {
                await onSuccess();
                setStep('success');
                setTimeout(() => handleClose(), 3500);
            } else {
                setStep(result); // 'failed' or 'timeout'
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'An unexpected error occurred.');
            setStep('error');
        }
    };

    // Reverify a single past transaction and surface result to user
    const handleReverify = async (txn) => {
        setVerifyingId(txn.id);
        setTxnFeedback(prev => ({ ...prev, [txn.id]: null })); // clear old feedback
        try {
            const { status, message, logs } = await reverifyTransaction(txn);

            if (status === 'success') {
                await onSuccess();
                setStep('success');
                setTimeout(() => handleClose(), 3500);
                return;
            }

            // Show the result inline in the history list
            setTxnFeedback(prev => ({ ...prev, [txn.id]: { status, message, logs } }));

            // Refresh list to reflect updated Firestore status
            const fresh = await fetchEssayTransactions(userId);
            setTransactions(fresh);
        } catch (err) {
            // Shouldn't happen since reverifyTransaction catches internally, but guard anyway
            setTxnFeedback(prev => ({ ...prev, [txn.id]: { status: 'error', message: err.message, logs: [] } }));
        } finally {
            setVerifyingId(null);
        }
    };

    const handleClose = () => {
        if (step === 'processing') return;
        setStep('overview');
        setPhone('');
        setDetectedOp(null);
        setErrorMsg('');
        onClose();
    };

    const opStyle = detectedOp ? OP_STYLE[detectedOp.operator] : null;
    const hdr = HDR[step] || HDR.overview;
    const pollPercent = Math.min((pollProgress.attempt / pollProgress.total) * 100, 95);

    // Number of non-successful transactions (to show on history badge)
    const pendingCount = transactions.filter(t => t.status === 'pending' || t.status === 'timeout').length;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <motion.div key="shell" initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    className="relative w-full max-w-md bg-bg-main rounded-3xl shadow-2xl overflow-hidden border border-glass-border">

                    {/* ── HEADER ── */}
                    <div className="h-26 bg-gradient-to-br from-indigo-600 to-purple-700 relative flex items-center justify-center overflow-hidden py-5">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                        </div>
                        <Sparkles className="text-white/30 absolute top-3 right-12" size={18} />
                        <div className="relative z-10 text-center px-10">
                            <h2 className="text-xl font-black text-white tracking-tight">{hdr.title}</h2>
                            <p className="text-white/70 text-[10px] font-medium uppercase tracking-widest mt-0.5">{hdr.sub}</p>
                        </div>
                    </div>

                    {/* Close */}
                    {step !== 'processing' && (
                        <button onClick={handleClose} className="absolute top-3 right-3.5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-20">
                            <X size={15} />
                        </button>
                    )}
                    {/* Back */}
                    {(step === 'payment' || step === 'history') && (
                        <button onClick={() => setStep('overview')} className="absolute top-3 left-3.5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-20">
                            <ArrowLeft size={15} />
                        </button>
                    )}

                    {/* ── OVERVIEW ── */}
                    {step === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
                            <div className="space-y-2 mb-5">
                                {FEATURES.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                                        <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center shrink-0">{f.icon}</div>
                                        <span>{f.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 mb-5">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">One-time · 1 Essay</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                        <Coins size={10} />
                                        Balance: {userTokens.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-indigo-700 dark:text-indigo-300">2,500</span>
                                    <span className="text-base font-bold text-indigo-600/60 dark:text-indigo-400/60 uppercase">Tokens</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleTokenPayment}
                                disabled={isDeducting}
                                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm mb-3">
                                {isDeducting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {userTokens >= 2500 ? 'Unlock Essay' : 'Get More Tokens'}
                            </button>

                            <button onClick={() => setStep('payment')}
                                className="w-full py-2.5 rounded-2xl border border-dashed border-glass-border hover:bg-surface-2 transition-all flex items-center justify-center gap-2 text-xs text-text-secondary mb-3">
                                <CreditCard size={13} />
                                Pay directly with Mobile Money
                            </button>

                            {/* History shortcut */}
                            {transactions.length > 0 && (
                                <button onClick={() => setStep('history')}
                                    className="w-full py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all flex items-center justify-between px-4 text-sm text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-2">
                                        <History size={14} />
                                        View previous transactions
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        {pendingCount > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold">
                                                {pendingCount} unverified
                                            </span>
                                        )}
                                        <ChevronRight size={13} />
                                    </span>
                                </button>
                            )}
                            <p className="text-center text-[10px] text-text-secondary mt-3 opacity-40">Secure · Malawian networks supported</p>
                        </motion.div>
                    )}

                    {/* ── HISTORY ── */}
                    {step === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-5">
                            <p className="text-xs text-text-secondary mb-4">
                                Previous payment attempts for Essay generation. Click <strong>Verify</strong> on any unverified transaction to check its status.
                            </p>

                            {loadingHist ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={22} className="animate-spin text-indigo-500" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <p className="text-center text-sm text-text-secondary py-8 opacity-50">No transactions yet.</p>
                            ) : (
                                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5 custom-scrollbar">
                                    {transactions.map(txn => {
                                        const ss = STATUS_STYLE[txn.status] || STATUS_STYLE.pending;
                                        const opInfo = OPERATORS[txn.operator];
                                        const isVerifying = verifyingId === txn.id;
                                        const canVerify = txn.status === 'pending' || txn.status === 'timeout';
                                        const createdAt = txn.createdAt?.toDate?.();
                                        const dateStr = createdAt
                                            ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(createdAt)
                                            : '—';

                                        const feedback = txnFeedback[txn.id];

                                        return (
                                            <div key={txn.id} className="rounded-2xl bg-surface-2 border border-glass-border overflow-hidden">
                                                {/* Main row */}
                                                <div className="flex items-center gap-3 p-3.5">
                                                    {/* Operator dot */}
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${txn.operator === 'airtel' ? 'bg-red-500' : 'bg-blue-600'}`} />

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[11px] font-bold text-text-primary">{opInfo?.name || txn.operator}</span>
                                                            <span className={`px-1.5 py-[1px] rounded text-[8px] font-bold uppercase ${ss.cls}`}>{ss.label}</span>
                                                        </div>
                                                        <p className="text-[10px] text-text-secondary mt-0.5 truncate">{txn.phone} · {dateStr}</p>
                                                        <p className="text-[9px] text-text-secondary opacity-40 font-mono truncate">ID: {txn.chargeId}</p>
                                                    </div>

                                                    {/* Verify / status indicator */}
                                                    {txn.status === 'success' ? (
                                                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                                            <Check size={13} strokeWidth={3} className="text-white" />
                                                        </div>
                                                    ) : canVerify ? (
                                                        <button
                                                            onClick={() => handleReverify(txn)}
                                                            disabled={!!verifyingId}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-bold transition-all shrink-0"
                                                        >
                                                            {isVerifying
                                                                ? <Loader2 size={10} className="animate-spin" />
                                                                : <RefreshCw size={10} />
                                                            }
                                                            Verify
                                                        </button>
                                                    ) : (
                                                        <AlertCircle size={16} className="text-zinc-400 shrink-0" />
                                                    )}
                                                </div>

                                                {/* Inline feedback after verify */}
                                                {feedback && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className={`px-4 pb-3.5 border-t ${feedback.status === 'success'
                                                            ? 'border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5'
                                                            : feedback.status === 'pending'
                                                                ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5'
                                                                : 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5'
                                                            }`}
                                                    >
                                                        {/* Main status message */}
                                                        <p className={`text-[10px] font-semibold mt-2.5 ${feedback.status === 'success' ? 'text-green-600 dark:text-green-400'
                                                            : feedback.status === 'pending' ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                            {feedback.message || 'No message returned.'}
                                                        </p>

                                                        {/* Log entries */}
                                                        {feedback.logs?.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {feedback.logs.map((log, li) => (
                                                                    <div key={li} className="flex items-start gap-1.5">
                                                                        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${log.type === 'error' ? 'bg-red-400' : 'bg-zinc-400'}`} />
                                                                        <p className="text-[9px] text-text-secondary opacity-70 leading-relaxed">{log.message}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button onClick={() => setStep('payment')}
                                className="w-full mt-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                                <CreditCard size={14} />
                                Make a New Payment
                            </button>
                        </motion.div>
                    )}

                    {/* ── PHONE INPUT ── */}
                    {step === 'payment' && (
                        <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
                            <p className="text-sm text-text-secondary mb-4">
                                Enter your Mobile Money number. Your network is detected automatically.
                            </p>

                            <div className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all ${opStyle ? `${opStyle.bg} ${opStyle.border}` : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10'}`}>
                                <Phone size={17} className={opStyle ? opStyle.text : 'text-zinc-400'} />
                                <input autoFocus type="tel" value={phone} onChange={handlePhoneChange}
                                    placeholder="e.g. 0993764649"
                                    className="flex-1 bg-transparent text-text-primary text-base font-medium placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none" />
                                {detectedOp && (
                                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 ${opStyle?.badge}`}>
                                        {detectedOp.info.name}
                                    </motion.span>
                                )}
                            </div>

                            <div className="flex gap-5 mt-2.5 mb-5">
                                {['airtel', 'tnm'].map(op => {
                                    const s = OP_STYLE[op];
                                    const active = detectedOp?.operator === op;
                                    return (
                                        <div key={op} className={`flex items-center gap-1.5 text-[10px] font-semibold transition-opacity ${active ? 'opacity-100' : 'opacity-35'}`}>
                                            <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                                            <span className={s.text}>{op === 'airtel' ? 'Airtel 09x' : 'TNM 08x'}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={handlePayment} disabled={!detectedOp || phone.length < 10}
                                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
                                <CreditCard size={15} />
                                Pay 2,500 MWK
                                {detectedOp && <span className="opacity-60 font-normal">via {detectedOp.info.name}</span>}
                            </button>
                            <p className="text-center text-[10px] text-text-secondary mt-3 opacity-40">
                                You'll receive a prompt on your phone to confirm.
                            </p>
                        </motion.div>
                    )}

                    {/* ── PROCESSING ── */}
                    {step === 'processing' && (
                        <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="px-7 py-10 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                                <Loader2 size={30} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                            </div>
                            <div>
                                <p className="font-bold text-text-primary">Waiting for Confirmation…</p>
                                <p className="text-sm text-text-secondary mt-1.5 max-w-[230px] mx-auto">
                                    Approve the <strong>{detectedOp?.info?.name}</strong> prompt on <strong>{phone}</strong> to proceed.
                                </p>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <motion.div className="h-full bg-indigo-500 rounded-full" animate={{ width: `${pollPercent}%` }} transition={{ duration: 0.8 }} />
                            </div>
                            <p className="text-[10px] text-text-secondary opacity-50 flex items-center gap-1">
                                <Clock size={9} /> Checking… {pollProgress.attempt}/{pollProgress.total}
                            </p>
                        </motion.div>
                    )}

                    {/* ── SUCCESS ── */}
                    {step === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="px-7 py-10 flex flex-col items-center text-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl shadow-green-500/20">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-black text-text-primary">Project Unlocked!</h3>
                            <p className="text-sm text-text-secondary">Payment confirmed. Let's generate your essay!</p>
                        </motion.div>
                    )}

                    {/* ── FAILED ── */}
                    {step === 'failed' && (
                        <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="px-7 py-8 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                <AlertCircle size={30} className="text-red-500" />
                            </div>
                            <div>
                                <p className="font-bold text-text-primary">Payment Declined</p>
                                <p className="text-sm text-text-secondary mt-1">Your transaction was cancelled or declined.</p>
                            </div>
                            <div className="flex gap-2 w-full">
                                <button onClick={() => setStep('history')} className="flex-1 py-2.5 rounded-xl border border-glass-border text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-all flex items-center justify-center gap-1.5">
                                    <History size={13} /> History
                                </button>
                                <button onClick={() => setStep('payment')} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all">
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── TIMEOUT ── */}
                    {step === 'timeout' && (
                        <motion.div key="timeout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="px-7 py-8 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                                <Clock size={30} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="font-bold text-text-primary">Confirmation Timed Out</p>
                                <p className="text-sm text-text-secondary mt-1 max-w-[230px] mx-auto">
                                    We couldn't confirm in time. If money was deducted, use the <strong>Verify</strong> button in history.
                                </p>
                            </div>
                            <div className="flex gap-2 w-full">
                                <button onClick={() => setStep('history')} className="flex-1 py-2.5 rounded-xl border border-glass-border text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-all flex items-center justify-center gap-1.5">
                                    <History size={13} /> Verify in History
                                </button>
                                <button onClick={() => setStep('payment')} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all">
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── ERROR ── */}
                    {step === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="px-7 py-8 flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                                <AlertCircle size={26} className="text-zinc-500" />
                            </div>
                            <div>
                                <p className="font-bold text-text-primary">Error</p>
                                <p className="text-sm text-text-secondary mt-1 max-w-[240px] mx-auto">{errorMsg}</p>
                            </div>
                            <button onClick={() => setStep('payment')} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all">
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            <BuyTokensModal
                isOpen={isBuyModalOpen}
                onClose={() => setIsBuyModalOpen(false)}
                userName={userName}
                userEmail={userEmail}
                userId={userId}
                onSuccess={() => {
                    setIsBuyModalOpen(false);
                }}
            />
        </AnimatePresence>
    );
};

export default PaymentModal;
