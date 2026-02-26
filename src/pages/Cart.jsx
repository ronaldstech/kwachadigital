import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Cart = () => {
    const { cart, removeFromCart, loading } = useStore();
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => {
        const price = typeof item.price === 'string'
            ? parseFloat(item.price.replace(/,/g, ''))
            : Number(item.price) || 0;
        return sum + price;
    }, 0);

    const handleCheckout = () => {
        toast.success('Proceeding to checkout... (Simulation)', {
            icon: '🛍️',
            style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-main flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pt-32 lg:pt-40 pb-32 overflow-hidden bg-bg-main">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate('/marketplace')}
                            className="group flex items-center gap-2 text-text-muted hover:text-primary transition-all mb-6"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Marketplace</span>
                        </motion.button>
                        <h1 className="text-4xl md:text-6xl font-display font-black text-text-primary tracking-tighter">
                            Your <span className="text-primary">Cart</span>
                        </h1>
                    </div>
                    <div className="glass px-6 py-3 rounded-2xl border-white/5 flex items-center gap-3">
                        <ShoppingBag size={20} className="text-primary" />
                        <span className="text-sm font-black text-text-primary uppercase tracking-widest">{cart.length} Assets</span>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium p-16 md:p-24 rounded-[40px] text-center border-white/5 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8">
                            <ShoppingCart size={40} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-black text-text-primary mb-4">Your cart is empty</h2>
                        <p className="text-text-muted max-w-md mb-10 font-medium">Looks like you haven't added any digital assets to your cart yet. Explore our marketplace to find premium tools for your next project.</p>
                        <Link to="/marketplace" className="btn btn-primary px-10 py-5 rounded-2xl flex items-center gap-3 group">
                            Explore Marketplace
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.productId}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass-premium p-6 rounded-[32px] border-white/5 flex flex-col sm:flex-row items-center gap-6 group hover:border-primary/20 transition-all duration-500"
                                    >
                                        <div className="w-full sm:w-32 aspect-square rounded-2xl overflow-hidden bg-surface-2 shrink-0">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted/20">
                                                    <ShoppingBag size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight line-clamp-1">{item.title}</h3>
                                                <p className="text-xl font-display font-black text-primary">MK {item.price.toLocaleString()}</p>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/5">
                                                {item.category || 'Digital Asset'}
                                            </p>
                                            <div className="flex items-center justify-center sm:justify-start gap-4">
                                                <button
                                                    onClick={() => removeFromCart(item.productId)}
                                                    className="flex items-center gap-2 p-2 px-4 rounded-xl glass hover:bg-red-500/10 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest border-white/5"
                                                >
                                                    <Trash2 size={14} />
                                                    Remove
                                                </button>
                                                <Link
                                                    to={`/product/${item.productId}`}
                                                    className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="glass-premium p-8 rounded-[40px] border-white/10 sticky top-40 bg-gradient-to-br from-bg-card to-transparent">
                                <h3 className="text-2xl font-display font-black text-text-primary mb-8">Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-text-muted">
                                        <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                                        <span className="font-bold">MK {total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-text-muted">
                                        <span className="text-xs font-bold uppercase tracking-widest">Platform Fee</span>
                                        <span className="font-bold text-emerald-500">Free</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-4" />
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1">Total Amount</span>
                                            <span className="text-3xl font-display font-black text-text-primary">MK {total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-primary text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 group"
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-center text-[10px] font-bold text-text-muted mt-6 uppercase tracking-widest opacity-50">
                                    Secure transaction via Kwacha Network
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
