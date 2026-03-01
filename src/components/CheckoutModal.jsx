import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, ShieldCheck, CreditCard, Zap, ArrowRight, Package, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const PAYMENT_METHODS = [
    { id: 'airtel', name: 'Airtel Money', description: 'Enter your Airtel number to pay', logo: '/airtel.svg', accent: '#ef4444' },
    { id: 'tnm', name: 'TNM Mpamba', description: 'Enter your TNM number to pay', logo: '/tnm.svg', accent: '#10b981' },
    { id: 'bank', name: 'Debit / Credit Card', description: 'Pay securely with your card', logo: null, icon: CreditCard, accent: '#3b82f6' },
];

const CheckoutModal = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, referrerId, loading: storeLoading } = useStore();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState(null);

    // Mobile money fields
    const [phoneNumber, setPhoneNumber] = useState('');

    // Card fields
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const [paying, setPaying] = useState(false);
    const [success, setSuccess] = useState(false);

    const total = cart.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : Number(item.price) || 0;
        return sum + price;
    }, 0);

    const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

    const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 4);
        return clean.length >= 3 ? `${clean.slice(0, 2)} / ${clean.slice(2)}` : clean;
    };

    const handleContinue = () => {
        if (!selectedMethod) { toast.error('Please select a payment method.'); return; }
        setStep(2);
    };

    const handlePay = async () => {
        if ((selectedMethod === 'airtel' || selectedMethod === 'tnm') && phoneNumber.replace(/\D/g, '').length < 9) {
            toast.error('Please enter a valid phone number.'); return;
        }
        if (selectedMethod === 'bank') {
            if (cardName.trim().length < 2) { toast.error('Please enter the cardholder name.'); return; }
            if (cardNumber.replace(/\s/g, '').length < 16) { toast.error('Please enter a valid 16-digit card number.'); return; }
            if (cardExpiry.replace(/\D/g, '').length < 4) { toast.error('Please enter a valid expiry date.'); return; }
            if (cardCvv.replace(/\D/g, '').length < 3) { toast.error('Please enter a valid CVV.'); return; }
        }

        setPaying(true);
        try {
            await addDoc(collection(db, 'orders'), {
                userId: user?.uid || 'guest',
                userEmail: user?.email || 'guest',
                userName: user?.name || cardName || 'Guest',
                items: cart.map(item => ({
                    productId: item.productId,
                    sellerId: item.sellerId || null,
                    title: item.title,
                    price: item.price,
                    imageUrl: item.imageUrl || null,
                    category: item.category || null,
                })),
                sellerIds: [...new Set(cart.map(item => item.sellerId).filter(id => id))],
                referrerId: referrerId || null,
                referralCommission: referrerId ? (total * 0.10) : 0,
                total,
                paymentMethod: selectedMethod,
                paymentDetails: selectedMethod === 'bank'
                    ? { cardName, lastFour: cardNumber.replace(/\s/g, '').slice(-4) }
                    : { phoneNumber },
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            for (const item of cart) {
                await removeFromCart(item.productId);
                // Increment salesCount for each product purchased
                try {
                    const productRef = doc(db, 'products', item.productId);
                    await updateDoc(productRef, {
                        salesCount: increment(1)
                    });
                } catch (salesErr) {
                    console.error("Error incrementing salesCount:", salesErr);
                }
            }

            // Attribute 10% commission to referrer if one exists
            if (referrerId) {
                const commissionAmount = total * 0.10;
                try {
                    const referrerRef = doc(db, 'users', referrerId);
                    await setDoc(referrerRef, {
                        points: increment(commissionAmount)
                    }, { merge: true });
                } catch (commissionErr) {
                    console.error('Failed to attribute commission:', commissionErr);
                    // We don't want to block the success screen if this part fails
                }
            }

            setSuccess(true);
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setPaying(false);
        }
    };

    const handleClose = () => {
        setSuccess(false); setSelectedMethod(null); setStep(1);
        setPhoneNumber(''); setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCvv('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
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
                        {/* Mobile drag pill */}
                        <div className="w-10 h-1 rounded-full bg-glass-border mx-auto mt-4 mb-0 sm:hidden" />

                        {/* ── SUCCESS ── */}
                        <AnimatePresence>
                            {success && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 px-10 text-center">
                                    <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                                        className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                                        <CheckCircle size={44} className="fill-primary/20" />
                                    </motion.div>
                                    <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="text-3xl font-display font-black text-text-primary mb-3 tracking-tight">
                                        Order Confirmed!
                                    </motion.h2>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                        className="text-text-muted font-medium mb-12 max-w-xs leading-relaxed">
                                        Your order is being processed. You'll receive a confirmation notification shortly.
                                    </motion.p>
                                    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                        onClick={handleClose}
                                        className="bg-primary text-white font-black uppercase tracking-[0.2em] text-sm px-16 py-5 rounded-2xl hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95">
                                        Done
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!success && (
                            <>
                                {/* ── HEADER ── */}
                                <div className="px-7 pt-7 pb-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {step === 2 && (
                                            <button onClick={() => setStep(1)}
                                                className="w-9 h-9 rounded-xl glass border border-glass-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors mr-1">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4L6 8l4 4" /></svg>
                                            </button>
                                        )}
                                        <div>
                                            <h2 className="text-xl font-display font-black text-text-primary tracking-tight">
                                                {step === 1 ? 'Checkout' : 'Payment Details'}
                                            </h2>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                                                {step === 1 ? `${cart.length} item${cart.length !== 1 ? 's' : ''} · MK ${total.toLocaleString()}` : selectedMethodData?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={handleClose}
                                        className="w-10 h-10 rounded-2xl glass border border-glass-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all">
                                        <X size={17} />
                                    </button>
                                </div>

                                {/* Progress */}
                                <div className="px-7 mb-6">
                                    <div className="flex gap-2">
                                        <div className="h-1 flex-1 rounded-full bg-primary" />
                                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step === 2 ? 'bg-primary' : 'bg-glass-border'}`} />
                                    </div>
                                </div>

                                <div className="overflow-y-auto max-h-[75vh] px-7 pb-8">
                                    <AnimatePresence mode="wait">

                                        {/* ── STEP 1: Summary + Method ── */}
                                        {step === 1 && (
                                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mb-3">Your Order</p>
                                                <div className="mb-6 space-y-2">
                                                    {cart.map(item => (
                                                        <div key={item.productId} className="flex items-center gap-3 glass border border-glass-border p-3 rounded-2xl">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.title} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-glass-border" />
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-xl glass border border-glass-border flex items-center justify-center shrink-0">
                                                                    <Package size={18} className="text-text-muted" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-text-primary truncate">{item.title}</p>
                                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{item.category || 'Digital Asset'}</p>
                                                            </div>
                                                            <span className="text-sm font-black text-primary shrink-0">MK {Number(item.price).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center pt-3 border-t border-glass-border">
                                                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Total</span>
                                                        <span className="text-xl font-display font-black text-primary">MK {total.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mb-3">Payment Method</p>
                                                <div className="space-y-3 mb-8">
                                                    {PAYMENT_METHODS.map(method => {
                                                        const isSelected = selectedMethod === method.id;
                                                        return (
                                                            <motion.button key={method.id} onClick={() => setSelectedMethod(method.id)} whileTap={{ scale: 0.98 }}
                                                                className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden glass"
                                                                style={{
                                                                    borderColor: isSelected ? `${method.accent}70` : undefined,
                                                                    backgroundColor: isSelected ? `${method.accent}10` : undefined,
                                                                }}>
                                                                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-surface-2"
                                                                    style={isSelected ? { backgroundColor: `${method.accent}18` } : {}}>
                                                                    {method.logo
                                                                        ? <img src={method.logo} alt={method.name} className="w-9 h-9 object-contain" />
                                                                        : <method.icon size={24} style={{ color: method.accent }} />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-black text-text-primary text-sm">{method.name}</p>
                                                                    <p className="text-[11px] text-text-secondary font-medium">{method.description}</p>
                                                                </div>
                                                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300"
                                                                    style={{ borderColor: isSelected ? method.accent : 'rgba(128,128,128,0.3)', backgroundColor: isSelected ? method.accent : 'transparent' }}>
                                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>

                                                <button onClick={handleContinue} disabled={!selectedMethod}
                                                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-primary text-white hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)]">
                                                    Continue <ArrowRight size={17} />
                                                </button>
                                                <div className="flex items-center justify-center gap-2 mt-5">
                                                    <ShieldCheck size={12} className="text-primary/60" />
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">256-bit secured · Kwacha Network</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ── STEP 2: Payment Details ── */}
                                        {step === 2 && (
                                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>

                                                {/* Method recap */}
                                                {selectedMethodData && (
                                                    <div className="flex items-center gap-4 p-4 rounded-2xl border glass mb-6"
                                                        style={{ borderColor: `${selectedMethodData.accent}40`, backgroundColor: `${selectedMethodData.accent}08` }}>
                                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-surface-2"
                                                            style={{ backgroundColor: `${selectedMethodData.accent}15` }}>
                                                            {selectedMethodData.logo
                                                                ? <img src={selectedMethodData.logo} alt={selectedMethodData.name} className="w-8 h-8 object-contain" />
                                                                : <selectedMethodData.icon size={22} style={{ color: selectedMethodData.accent }} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-text-primary text-sm">{selectedMethodData.name}</p>
                                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Selected Method</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ── MOBILE MONEY (Airtel / TNM) ── */}
                                                {(selectedMethod === 'airtel' || selectedMethod === 'tnm') && (
                                                    <div className="mb-6">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-3">
                                                            {selectedMethod === 'airtel' ? 'Airtel Money' : 'TNM Mpamba'} Number
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                                                                <img src={selectedMethodData?.logo} alt="" className="w-5 h-5 object-contain" />
                                                                <span className="text-text-secondary font-black text-sm">+265</span>
                                                                <div className="w-px h-5 bg-glass-border" />
                                                            </div>
                                                            <input
                                                                type="tel"
                                                                value={phoneNumber}
                                                                onChange={e => setPhoneNumber(e.target.value)}
                                                                placeholder={selectedMethod === 'airtel' ? '991 234 567' : '881 234 567'}
                                                                className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl pl-28 pr-5 py-5 text-text-primary text-sm font-bold bg-transparent outline-none placeholder:text-text-muted/40 transition-colors"
                                                                maxLength={12}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-text-muted mt-2 font-medium leading-relaxed">
                                                            You will receive a push notification on your {selectedMethod === 'airtel' ? 'Airtel' : 'TNM'} number. Approve it to complete payment.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* ── CARD PAYMENT ── */}
                                                {selectedMethod === 'bank' && (
                                                    <div className="mb-6 space-y-4">
                                                        {/* Card preview */}
                                                        <div className="relative h-44 rounded-3xl p-6 overflow-hidden"
                                                            style={{ background: 'linear-gradient(135deg, #283ae1ff, #059669)' }}>
                                                            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
                                                            <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5" />
                                                            <div className="relative z-10 h-full flex flex-col justify-between">
                                                                <div className="flex justify-between items-start">
                                                                    <Lock size={18} className="text-white/70" />
                                                                    <CreditCard size={28} className="text-white/80" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-black text-lg tracking-[0.3em] mb-2">
                                                                        {cardNumber ? cardNumber.padEnd(19, '·').replace(/(.{4})/g, '$1 ').trim() : '···· ···· ···· ····'}
                                                                    </p>
                                                                    <div className="flex justify-between items-end">
                                                                        <div>
                                                                            <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-0.5">Cardholder</p>
                                                                            <p className="text-sm font-black text-white uppercase tracking-wide">{cardName || 'Your Name'}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-0.5">Expires</p>
                                                                            <p className="text-sm font-black text-white">{cardExpiry || 'MM / YY'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Card Name */}
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-2">Cardholder Name</label>
                                                            <input type="text" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                                                                placeholder="JOHN DOE"
                                                                className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl px-5 py-4 text-text-primary text-sm font-bold bg-transparent outline-none placeholder:text-text-muted/40 transition-colors uppercase tracking-wide" />
                                                        </div>

                                                        {/* Card Number */}
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-2">Card Number</label>
                                                            <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                                                placeholder="0000 0000 0000 0000"
                                                                className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl px-5 py-4 text-text-primary text-sm font-bold bg-transparent outline-none placeholder:text-text-muted/40 transition-colors tracking-widest" />
                                                        </div>

                                                        {/* Expiry + CVV */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-2">Expiry Date</label>
                                                                <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                                                    placeholder="MM / YY"
                                                                    className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl px-5 py-4 text-text-primary text-sm font-bold bg-transparent outline-none placeholder:text-text-muted/40 transition-colors" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-2">CVV</label>
                                                                <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                                    placeholder="•••"
                                                                    className="w-full glass border border-glass-border focus:border-primary/60 rounded-2xl px-5 py-4 text-text-primary text-sm font-bold bg-transparent outline-none placeholder:text-text-muted/40 transition-colors" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Amount Summary */}
                                                <div className="glass border border-glass-border rounded-2xl p-5 mb-6">
                                                    <div className="flex justify-between text-text-muted text-xs font-bold mb-3">
                                                        <span className="uppercase tracking-widest">Subtotal</span>
                                                        <span className="text-text-primary">MK {total.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-bold mb-3">
                                                        <span className="text-text-muted uppercase tracking-widest">Platform Fee</span>
                                                        <span className="text-emerald-500 font-black">FREE</span>
                                                    </div>
                                                    <div className="h-px bg-glass-border mb-3" />
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Due</span>
                                                        <span className="text-2xl font-display font-black text-primary">MK {total.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <button onClick={handlePay} disabled={paying || storeLoading}
                                                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                                                    style={{
                                                        background: selectedMethodData ? `linear-gradient(135deg, ${selectedMethodData.accent}, ${selectedMethodData.accent}bb)` : '#10b981',
                                                        boxShadow: selectedMethodData ? `0 15px 40px -10px ${selectedMethodData.accent}50` : undefined,
                                                    }}>
                                                    {paying ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><Zap size={18} /> Pay MK {total.toLocaleString()}</>}
                                                </button>

                                                <div className="flex items-center justify-center gap-2 mt-5">
                                                    <ShieldCheck size={12} className="text-primary/60" />
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">256-bit secured · Kwacha Network</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
