import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    ChevronRight,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Search,
    Calendar,
    CreditCard,
    CreditCard as DebitCard,
    Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'completed':
            case 'approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-text-muted bg-surface-2 border-glass-border';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock size={14} />;
            case 'completed':
            case 'approved': return <CheckCircle2 size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Package size={14} />;
        }
    };

    const getPaymentIcon = (method) => {
        switch (method?.toLowerCase()) {
            case 'airtel':
            case 'tnm': return <Smartphone size={16} />;
            case 'bank': return <DebitCard size={16} />;
            default: return <CreditCard size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-3">
                            My <span className="text-gradient">Orders</span>
                        </h1>
                        <p className="text-text-muted font-medium max-w-xl">
                            Track your digital assets, downloads, and purchase history in one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'approved', 'cancelled'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                    : 'glass text-text-muted border border-glass-border hover:border-primary/40'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {filteredOrders.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-premium rounded-[44px] border border-glass-border p-12 md:p-20 text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-surface-2 border border-glass-border flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag size={40} className="text-text-muted opacity-50" />
                    </div>
                    <h2 className="text-2xl font-display font-black text-text-primary mb-4 tracking-tight">No Orders Found</h2>
                    <p className="text-text-secondary font-medium mb-12 max-w-md mx-auto leading-relaxed">
                        {filter === 'all'
                            ? "You haven't placed any orders yet. Explore our marketplace to find premium digital assets."
                            : `You don't have any ${filter} orders at the moment.`}
                    </p>
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-3 bg-primary text-white font-black uppercase tracking-[0.2em] text-sm px-10 py-5 rounded-2xl hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95 no-underline"
                    >
                        Start Shopping <ArrowRight size={18} />
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-premium rounded-3xl border border-glass-border p-6 md:p-8 hover:border-primary/30 transition-all group overflow-hidden relative"
                        >
                            {/* Background Accent */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Order Info Sidebar */}
                                    <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-glass-border/50 pb-6 lg:pb-0 lg:pr-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status || 'Pending'}
                                            </div>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {order.createdAt?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Order ID</p>
                                                <p className="text-sm font-bold text-text-primary truncate">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Amount</p>
                                                <p className="text-xl font-display font-black text-primary">MK {Number(order.total).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Payment</p>
                                                <div className="flex items-center gap-2 text-text-secondary">
                                                    {getPaymentIcon(order.paymentMethod)}
                                                    <span className="text-xs font-bold capitalize">{order.paymentMethod}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full mt-8 py-3 rounded-xl bg-surface-2 text-text-muted hover:text-text-primary hover:bg-glass border border-glass-border transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                            Invoice <ChevronRight size={14} />
                                        </button>
                                    </div>

                                    {/* Order Items */}
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Items Summary</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl glass border border-glass-border group-hover:border-primary/20 transition-all">
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-2 border border-glass-border shrink-0">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-text-primary truncate">{item.title}</p>
                                                        <div className="flex justify-between items-center mt-0.5">
                                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{item.category}</p>
                                                            <p className="text-xs font-black text-primary">MK {Number(item.price).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
