import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Phone, DollarSign, Loader2, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { db } from '../firebase';
import { doc, addDoc, setDoc, increment, collection, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const RedemptionModal = ({ isOpen, onClose, user }) => {
    const availablePoints = user?.points || 0;

    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState(user?.phone || '');
    const [network, setNetwork] = useState('airtel');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const numericAmount = parseFloat(amount) || 0;
    const isValid = numericAmount > 0
        && numericAmount <= availablePoints
        && phone.replace(/\D/g, '').length >= 9;

    const handleSubmit = async () => {
        if (!isValid) return;
        setSubmitting(true);
        try {
            // Save redemption request to Firestore
            await addDoc(collection(db, 'redemptions'), {
                userId: user.uid,
                userName: user.name || user.email,
                userEmail: user.email,
                amount: numericAmount,
                phone: phone.trim(),
                network,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            // Deduct the points from the user's balance
            await setDoc(doc(db, 'users', user.uid), {
                points: increment(-numericAmount)
            }, { merge: true });

            setSuccess(true);
        } catch (err) {
            console.error('Redemption error:', err);
            toast.error('Failed to submit redemption. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setAmount('');
        if (!user?.phone) setPhone('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
                    onClick={handleClose}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" />

                    <motion.div
                        initial={{ opacity: 0, y: 80, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 80, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full sm:max-w-md bg-bg-card backdrop-blur-3xl rounded-t-[44px] sm:rounded-[44px] border border-glass-border shadow-2xl overflow-hidden"
                    >
                        {/* Mobile pill */}
                        <div className="w-10 h-1 rounded-full bg-glass-border mx-auto mt-4 sm:hidden" />

                        {/* SUCCESS */}
                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 px-10 text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                                        className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-[0_0_60px_rgba(16,185,129,0.2)]"
                                    >
                                        <CheckCircle size={44} className="fill-primary/20" />
                                    </motion.div>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-3xl font-display font-black text-text-primary mb-3 tracking-tight"
                                    >
                                        Request Sent!
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-text-muted font-medium mb-12 max-w-xs leading-relaxed"
                                    >
                                        MK {numericAmount.toLocaleString()} will be sent to <span className="text-primary font-bold">{phone}</span> within 24 hours.
                                    </motion.p>
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        onClick={handleClose}
                                        className="bg-primary text-white font-black uppercase tracking-[0.2em] text-sm px-16 py-5 rounded-2xl hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                                    >
                                        Done
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* FORM */}
                        {!success && (
                            <>
                                {/* Header */}
                                <div className="px-7 pt-7 pb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-display font-black text-text-primary tracking-tight">Redeem Points</h2>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                                            Available: MK {availablePoints.toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-10 h-10 rounded-2xl glass border border-glass-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>

                                <div className="px-7 pb-8 space-y-6">
                                    {/* Amount */}
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-3">
                                            Amount to Redeem (MK)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <DollarSign size={16} className="text-primary" />
                                                <div className="w-px h-5 bg-glass-border" />
                                            </div>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                placeholder="0"
                                                min="1"
                                                max={availablePoints}
                                                className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl pl-16 pr-5 py-5 text-text-primary text-lg font-black bg-transparent outline-none placeholder:text-text-muted/40 transition-colors"
                                            />
                                        </div>
                                        {numericAmount > availablePoints && (
                                            <p className="text-red-400 text-[10px] font-bold mt-2">Amount exceeds your available balance.</p>
                                        )}
                                        {/* Quick fill buttons */}
                                        <div className="flex gap-2 mt-3">
                                            {[25, 50, 100].map(pct => {
                                                const val = Math.floor(availablePoints * pct / 100);
                                                return (
                                                    <button
                                                        key={pct}
                                                        onClick={() => setAmount(String(val))}
                                                        className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest glass border border-glass-border rounded-xl hover:border-primary/40 hover:text-primary transition-all"
                                                    >
                                                        {pct}%
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setAmount(String(availablePoints))}
                                                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest glass border border-glass-border rounded-xl hover:border-primary/40 hover:text-primary transition-all"
                                            >
                                                Max
                                            </button>
                                        </div>
                                    </div>

                                    {/* Network selector */}
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-3">
                                            Mobile Network
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={network}
                                                onChange={e => setNetwork(e.target.value)}
                                                className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl px-5 py-4 text-text-primary text-sm font-bold bg-bg-card outline-none appearance-none pr-12 transition-colors"
                                            >
                                                <option value="airtel">Airtel Money</option>
                                                <option value="tnm">TNM Mpamba</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-3">
                                            {network === 'airtel' ? 'Airtel Money' : 'TNM Mpamba'} Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                                                <Phone size={16} className="text-primary" />
                                                <span className="text-text-secondary font-black text-sm">+265</span>
                                                <div className="w-px h-5 bg-glass-border" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder={network === 'airtel' ? '991 234 567' : '881 234 567'}
                                                className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl pl-32 pr-5 py-5 text-text-primary text-sm font-bold bg-transparent outline-none placeholder:text-text-muted/40 transition-colors"
                                                maxLength={12}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isValid || submitting}
                                        className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-primary text-white hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)]"
                                    >
                                        {submitting
                                            ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                            : <><Wallet size={18} /> Redeem MK {numericAmount > 0 ? numericAmount.toLocaleString() : '--'} <ArrowRight size={18} /></>
                                        }
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RedemptionModal;
