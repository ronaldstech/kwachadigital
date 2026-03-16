import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, CreditCard, Sparkles, Zap, Phone,
    ArrowLeft, Loader2, AlertCircle, Clock, Coins, Smartphone
} from 'lucide-react';
import { detectOperator, processTokenPurchase, fetchOperators } from '../services/paychangu';

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

const BuyTokensModal = ({ isOpen, onClose, user }) => {
    const [step, setStep] = useState('packs'); // 'packs' | 'payment' | 'processing' | 'success' | 'failed' | 'timeout' | 'error'
    const [selectedPack, setSelectedPack] = useState(TOKEN_PACKS[1]);
    const [customAmount, setCustomAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [detectedOp, setDetectedOp] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [pollProgress, setPollProgress] = useState({ attempt: 0, total: 20 });


    useEffect(() => {
        if (isOpen) {
            fetchOperators().catch(() => { });
            setStep('packs');
        }
    }, [isOpen]);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
        setPhone(val);
        setDetectedOp(detectOperator(val));
    };

    const handlePurchase = async () => {
        if (!detectedOp || phone.length < 10 || !selectedPack || !user) return;
        setStep('processing');
        setErrorMsg('');
        setPollProgress({ attempt: 0, total: 20 });

        try {
            const parts = (user.name || 'User').trim().split(' ');
            const firstName = parts[0] || 'User';
            const lastName = parts.slice(1).join(' ') || '-';

            const finalAmount = selectedPack.id === 'custom' ? parseInt(customAmount) : selectedPack.price;

            const result = await processTokenPurchase({
                phone,
                email: user.email,
                firstName,
                lastName,
                operator: detectedOp.operator,
                userId: user.uid,
                amount: finalAmount,
                onStatusUpdate: ({ attempt, total }) => setPollProgress({ attempt, total })
            });


            if (result === 'success') {
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
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-bg-card backdrop-blur-3xl rounded-[40px] shadow-2xl overflow-hidden border border-glass-border">

                    {/* Header */}
                    <div className="h-30 bg-gradient-to-br from-primary to-emerald-600 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                        </div>
                        <Coins className="text-white/20 absolute -bottom-6 -right-6" size={120} />
                        <div className="relative z-10 text-center">
                            <h2 className="text-3xl font-display font-black text-white tracking-tight">Buy Tokens</h2>
                            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2">1 MWK = 1 Token</p>
                        </div>

                        {step !== 'processing' && (
                            <button onClick={handleClose} className="absolute top-6 right-6 p-2.5 rounded-2xl glass border border-white/10 hover:bg-white/10 text-white transition-colors">
                                <X size={18} />
                            </button>
                        )}
                        {step === 'payment' && (
                            <button onClick={() => setStep('packs')} className="absolute top-6 left-6 p-2.5 rounded-2xl glass border border-white/10 hover:bg-white/10 text-white transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                        )}
                    </div>

                    <div className="p-8">
                        {step === 'packs' && (
                            <div className="space-y-4">
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] text-center mb-6">Select a token pack or enter a custom amount.</p>

                                {TOKEN_PACKS.map((pack) => (
                                    <button
                                        key={pack.id}
                                        onClick={() => setSelectedPack(pack)}
                                        className={`w-full p-3 rounded-[24px] border-2 transition-all flex items-center justify-between group ${selectedPack?.id === pack.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-glass-border bg-surface-1 hover:border-primary/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl glass border border-glass-border flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                                {pack.icon}
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-text-primary uppercase text-sm tracking-tight">{pack.label}</span>
                                                    {pack.popular && (
                                                        <span className="px-2 py-0.5 rounded-lg bg-primary text-[8px] font-black text-white uppercase tracking-tighter">Popular</span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-text-muted">{pack.tokens.toLocaleString()} Tokens</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-display font-black text-primary">MK {pack.price.toLocaleString()}</span>
                                        </div>
                                    </button>
                                ))}

                                {/* Custom Amount Option */}
                                <button
                                    onClick={() => setSelectedPack({ id: 'custom', label: 'Custom Amount' })}
                                    className={`w-full p-5 rounded-[24px] border-2 transition-all flex items-center justify-between group ${selectedPack?.id === 'custom'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-glass-border bg-surface-1 hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl glass border border-glass-border flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                            <CreditCard size={14} className="text-zinc-400" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-black text-text-primary uppercase text-sm tracking-tight text-zinc-400">Custom Amount</span>
                                            <div className="text-[10px] font-bold text-text-muted">Enter any amount (Min: MK 100)</div>
                                        </div>
                                    </div>
                                    {selectedPack?.id === 'custom' && (
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2 border border-glass-border">
                                                <span className="text-xs font-black text-text-muted">MK</span>
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    value={customAmount}
                                                    onChange={(e) => setCustomAmount(e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 bg-transparent text-right font-display font-black text-primary focus:outline-none placeholder:opacity-30"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        if (selectedPack?.id === 'custom') {
                                            const amt = parseInt(customAmount);
                                            if (!amt || amt < 100) {
                                                setErrorMsg('Minimum amount is MK 100');
                                                setStep('error');
                                                return;
                                            }
                                        }
                                        setStep('payment');
                                    }}
                                    className="w-full py-5 mt-4 rounded-2xl bg-primary hover:shadow-2xl hover:shadow-primary/30 text-white font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowLeft className="rotate-180" size={18} />
                                </button>

                            </div>
                        )}

                        {step === 'payment' && (
                            <div className="space-y-6">
                                <div className="p-5 rounded-3xl glass border border-glass-border">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Amount</span>
                                        <span className="font-bold text-text-primary text-sm">
                                            MK {(selectedPack?.id === 'custom' ? parseInt(customAmount) : selectedPack?.price).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tokens to Receive</span>
                                        <span className="font-black text-primary">
                                            {(selectedPack?.id === 'custom' ? parseInt(customAmount) : selectedPack?.tokens).toLocaleString()}
                                        </span>
                                    </div>
                                </div>


                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-3 ml-1">Mobile Money Number</label>
                                    <div className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-4.5 transition-all ${opStyle ? `${opStyle.bg} ${opStyle.border}` : 'glass border-glass-border'}`}>
                                        <Phone size={17} className={opStyle ? opStyle.text : 'text-text-muted'} />
                                        <input autoFocus type="tel" value={phone} onChange={handlePhoneChange}
                                            placeholder="099 234 567"
                                            className="flex-1 bg-transparent text-text-primary text-sm font-bold placeholder:text-text-muted/40 focus:outline-none" />
                                        {detectedOp && (
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${opStyle?.badge}`}>
                                                {detectedOp.info.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button onClick={handlePurchase} disabled={!detectedOp || phone.length < 10}
                                    className="w-full py-5 rounded-2xl bg-primary hover:shadow-2xl hover:shadow-primary/30 disabled:opacity-40 text-white font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-2">
                                    <CreditCard size={18} />
                                    Complete Payment
                                </button>
                            </div>
                        )}

                        {step === 'processing' && (
                            <div className="py-12 flex flex-col items-center text-center gap-8">
                                <div className="w-24 h-24 rounded-[32px] glass border-2 border-primary/20 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-[32px] border-2 border-primary border-t-transparent animate-spin" />
                                    <Smartphone size={32} className="text-primary animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-black text-text-primary mb-2">Awaiting Approval</h3>
                                    <p className="text-sm text-text-muted max-w-[240px] mx-auto">Please confirm the prompt on your phone ({phone})</p>
                                </div>
                                <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
                                    <motion.div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        animate={{ width: `${pollPercent}%` }} transition={{ duration: 0.8 }} />
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="py-12 flex flex-col items-center text-center gap-8">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
                                    <Check size={48} strokeWidth={3} />
                                </motion.div>
                                <div>
                                    <h3 className="text-3xl font-display font-black text-text-primary mb-2">Tokens Added!</h3>
                                    <p className="text-sm text-text-muted">
                                        Your balance has been updated with {(selectedPack?.id === 'custom' ? parseInt(customAmount) : selectedPack?.tokens).toLocaleString()} tokens.
                                    </p>
                                </div>

                            </div>
                        )}

                        {(step === 'failed' || step === 'timeout' || step === 'error') && (
                            <div className="py-10 flex flex-col items-center text-center gap-8">
                                <div className="w-24 h-24 rounded-[32px] bg-red-500/10 flex items-center justify-center">
                                    <AlertCircle size={48} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-display font-black text-text-primary mb-2">
                                        {step === 'timeout' ? 'Payment Timed Out' : 'Payment Failed'}
                                    </h3>
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        {errorMsg || 'Something went wrong during the transaction. Please try again.'}
                                    </p>
                                </div>
                                <button onClick={() => setStep('payment')}
                                    className="w-full py-5 rounded-2xl bg-surface-2 text-text-primary hover:bg-surface-3 transition-colors font-black uppercase tracking-[0.2em] text-sm">
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BuyTokensModal;
