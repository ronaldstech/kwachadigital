import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, CreditCard, Sparkles, Zap, Phone,
    ArrowLeft, Loader2, AlertCircle, Clock, Coins
} from 'lucide-react';
import { detectOperator, processTokenPurchase, OPERATORS, fetchOperators } from '../../../services/paychangu';


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

const TOKEN_PACKS = [
    { id: 'starter', tokens: 1000, price: 1000, label: 'Starter Pack', icon: <Zap size={14} className="text-yellow-500" /> },
    { id: 'popular', tokens: 5000, price: 5000, label: 'Value Pack', icon: <Sparkles size={14} className="text-indigo-500" />, popular: true },
    { id: 'pro', tokens: 10000, price: 10000, label: 'Pro Pack', icon: <Coins size={14} className="text-amber-500" /> },
];

const BuyTokensModal = ({ isOpen, onClose, onSuccess, userName, userEmail, userId }) => {
    const [step, setStep] = useState('packs'); // 'packs' | 'payment' | 'processing' | 'success' | 'failed' | 'timeout' | 'error'
    const [selectedPack, setSelectedPack] = useState(TOKEN_PACKS[1]);
    const [phone, setPhone] = useState('');
    const [detectedOp, setDetectedOp] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [pollProgress, setPollProgress] = useState({ attempt: 0, total: 20 });

    useEffect(() => {
        if (isOpen) {
            fetchOperators().catch(() => { });
        }
    }, [isOpen]);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
        setPhone(val);
        setDetectedOp(detectOperator(val));
    };

    const handlePurchase = async () => {
        if (!detectedOp || phone.length < 10 || !selectedPack) return;
        setStep('processing');
        setErrorMsg('');
        setPollProgress({ attempt: 0, total: 20 });

        try {
            const parts = (userName || 'User').trim().split(' ');
            const firstName = parts[0] || 'User';
            const lastName = parts.slice(1).join(' ') || '-';

            const result = await processTokenPurchase({
                phone, 
                email: userEmail || 'user@example.com',
                firstName, 
                lastName, 
                operator: detectedOp.operator,
                userId: userId || 'unknown',
                amount: selectedPack.price,
                onStatusUpdate: ({ attempt, total }) => setPollProgress({ attempt, total })
            });

            if (result === 'success') {
                if (onSuccess) await onSuccess(selectedPack.tokens);
                setStep('success');
                setTimeout(() => handleClose(), 3000);
            } else {
                setStep(result);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'An unexpected error occurred.');
            setStep('error');
        }
    };

    const handleClose = () => {
        if (step === 'processing') return;
        setStep('packs');
        setPhone('');
        setDetectedOp(null);
        setErrorMsg('');
        onClose();
    };

    if (!isOpen) return null;

    const opStyle = detectedOp ? OP_STYLE[detectedOp.operator] : null;
    const pollPercent = Math.min((pollProgress.attempt / pollProgress.total) * 100, 95);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/10">

                    {/* Header */}
                    <div className="h-32 bg-gradient-to-br from-amber-500 to-orange-600 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                        </div>
                        <Coins className="text-white/20 absolute -bottom-4 -right-4" size={100} />
                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-black text-white">Buy Tokens</h2>
                            <p className="text-white/80 text-xs font-medium uppercase tracking-widest mt-1">1 MWK = 1 Token</p>
                        </div>
                        
                        {step !== 'processing' && (
                            <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors">
                                <X size={20} />
                            </button>
                        )}
                        {step === 'payment' && (
                            <button onClick={() => setStep('packs')} className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {step === 'packs' && (
                            <div className="space-y-4">
                                <p className="text-sm text-[var(--text-secondary)] text-center mb-6">Select a token pack to recharge your account.</p>
                                {TOKEN_PACKS.map((pack) => (
                                    <button
                                        key={pack.id}
                                        onClick={() => setSelectedPack(pack)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                            selectedPack?.id === pack.id 
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' 
                                            : 'border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 hover:border-amber-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
                                                {pack.icon}
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[var(--text-primary)]">{pack.label}</span>
                                                    {pack.popular && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-[8px] font-black text-white uppercase tracking-tighter">Popular</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-[var(--text-secondary)]">{pack.tokens.toLocaleString()} Tokens</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-amber-600 dark:text-amber-400">MK{pack.price.toLocaleString()}</span>
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setStep('payment')}
                                    className="w-full py-4 mt-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Continue with {selectedPack?.label}
                                </button>
                            </div>
                        )}

                        {step === 'payment' && (
                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-[var(--text-secondary)]">Total Amount</span>
                                        <span className="font-bold text-[var(--text-primary)]">MK{selectedPack?.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--text-secondary)]">Tokens to Receive</span>
                                        <span className="font-black text-amber-500">{selectedPack?.tokens.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all ${opStyle ? `${opStyle.bg} ${opStyle.border}` : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10'}`}>
                                    <Phone size={17} className={opStyle ? opStyle.text : 'text-zinc-400'} />
                                    <input autoFocus type="tel" value={phone} onChange={handlePhoneChange}
                                        placeholder="Mobile Money Number"
                                        className="flex-1 bg-transparent text-[var(--text-primary)] text-base font-medium placeholder:text-zinc-400 focus:outline-none" />
                                    {detectedOp && (
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${opStyle?.badge}`}>
                                            {detectedOp.info.name}
                                        </span>
                                    )}
                                </div>

                                <button onClick={handlePurchase} disabled={!detectedOp || phone.length < 10}
                                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                                    <CreditCard size={18} />
                                    Complete Payment
                                </button>
                            </div>
                        )}

                        {step === 'processing' && (
                            <div className="py-10 flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                                <div>
                                    <p className="font-bold text-[var(--text-primary)] text-lg">Waiting for Confirmation</p>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">Approve the prompt on your phone ({phone})</p>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                                    <motion.div className="h-full bg-amber-500 rounded-full" animate={{ width: `${pollPercent}%` }} transition={{ duration: 0.8 }} />
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="py-10 flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                                    <Check size={40} strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-primary)]">Tokens Added!</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Your balance has been updated with {selectedPack?.tokens.toLocaleString()} tokens.</p>
                                </div>
                            </div>
                        )}

                        {(step === 'failed' || step === 'timeout' || step === 'error') && (
                            <div className="py-8 flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                    <AlertCircle size={40} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-primary)] text-lg">
                                        {step === 'timeout' ? 'Payment Timed Out' : 'Payment Failed'}
                                    </p>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">{errorMsg || 'Something went wrong during the transaction.'}</p>
                                </div>
                                <button onClick={() => setStep('payment')} className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold">Try Again</button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BuyTokensModal;
