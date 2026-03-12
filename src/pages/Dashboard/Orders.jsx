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
    DollarSign,
    User,
    Zap,
    Loader2,
    MoreVertical
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { reverifyTransaction } from '../../services/paychangu';
import { toast } from 'react-hot-toast';

const OrderCard = ({ order, isAdmin, currentUserId }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'success':
            case 'completed':
            case 'approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'failed':
            case 'timeout':
            case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-text-muted bg-surface-2 border-glass-border';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock size={14} />;
            case 'success':
            case 'completed':
            case 'approved': return <CheckCircle2 size={14} />;
            case 'failed':
            case 'timeout':
            case 'cancelled': return <XCircle size={14} />;
            default: return <Package size={14} />;
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            const transRef = doc(db, 'transactions', order.id);
            await updateDoc(transRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            toast.success(`Transaction marked as ${newStatus}`);
        } catch (err) {
            console.error("Error updating transaction:", err);
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVerify = async () => {
        if (!order.chargeId) {
            toast.error("Insufficient transaction data.");
            return;
        }
        setVerifying(true);
        try {
            const result = await reverifyTransaction(order);
            if (result.status === 'success') {
                toast.success(result.message || "Payment verified!");
            } else if (result.status === 'pending') {
                toast.loading(result.message || "Still pending...", { duration: 3000 });
            } else {
                toast.error(result.message || "Verification failed.");
            }
        } catch (err) {
            console.error("Verification error:", err);
            toast.error("Error during verification.");
        } finally {
            setVerifying(null);
        }
    };

    // Filter items to only show those belonging to the current seller if not admin
    const displayItems = isAdmin
        ? (order.items || [])
        : (order.items?.filter(item => item.sellerId === currentUserId) || []);

    const displayTotal = isAdmin
        ? (order.amount || order.total || 0)
        : displayItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium rounded-3xl border border-glass-border p-6 md:p-8 hover:border-primary/30 transition-all group overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Customer & Info Sidebar */}
                    <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-glass-border/50 pb-6 lg:pb-0 lg:pr-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status || 'Pending'}
                            </div>
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={12} />
                                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                            </span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Customer</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center border border-glass-border">
                                        <User size={12} className="text-primary" />
                                    </div>
                                    <p className="text-sm font-bold text-text-primary truncate uppercase">
                                        {order.firstName ? `${order.firstName} ${order.lastName || ''}` : (order.userName || order.email || 'Guest User')}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Transaction ID</p>
                                <p className="text-xs font-mono font-bold text-text-primary truncate">#{order.chargeId?.slice(-8).toUpperCase() || order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Stream Total</p>
                                <p className="text-2xl font-display font-black text-primary">MK {displayTotal.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {(order.status === 'pending' || order.status === 'timeout' || order.status === 'failed') && (
                                <button
                                    onClick={handleVerify}
                                    disabled={verifying}
                                    className="w-full py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {verifying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                    Verify Payment
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                            <span>Global Disbursement Stream</span>
                            <span className="text-text-muted/50 font-bold tracking-widest">{displayItems.length} {displayItems.length === 1 ? 'Asset' : 'Assets'}</span>
                        </p>
                        <div className={`grid grid-cols-1 gap-3 ${displayItems.length > 3 ? 'max-h-[350px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                            {displayItems.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl glass border border-glass-border hover:border-primary/20 hover:bg-white/5 transition-all group/item"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-2 border border-glass-border shrink-0 shadow-inner group-hover/item:border-primary/40 transition-colors">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <p className="text-sm font-bold text-text-primary truncate uppercase group-hover/item:text-primary transition-colors">{item.title}</p>
                                            <p className="text-sm font-black text-primary shrink-0">MK {Number(item.price).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest shrink-0 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">{item.category}</p>
                                            <span className="w-1 h-1 rounded-full bg-glass-border shrink-0" />
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider truncate">By <span className="text-text-secondary">{item.sellerName || 'Unknown Vendor'}</span></p>
                                        </div>
                                        {(order.status === 'success' || order.status === 'completed') && item.fileUrl && (
                                            <div className="mt-3">
                                                <a
                                                    href={item.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 hover:border-primary/30 transition-all shadow-sm border border-glass-border"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                    Link Provided
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!user) return;

        // Fetch from transactions for full traceability as requested
        const q = isAdmin
            ? query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))
            : query(
                collection(db, 'transactions'),
                where('sellerIds', 'array-contains', user.uid),
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
            console.error("Error fetching transactions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isAdmin]);

    const filteredOrders = orders.filter(order => {
        const orderItems = isAdmin
            ? (order.items || [])
            : (order.items?.filter(item => item.sellerId === user.uid) || []);

        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.chargeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orderItems.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;
        if (filter === 'all') return true;
        if (filter === 'approved') return order.status === 'success' || order.status === 'completed';
        if (filter === 'cancelled') return order.status === 'failed' || order.status === 'timeout';
        return order.status === filter;
    });

    const totalVolume = orders.reduce((sum, order) => {
        const isSuccess = order.status === 'success' || order.status === 'completed';
        if (!isSuccess) return sum;

        if (isAdmin) {
            return sum + (Number(order.amount || order.total) || 0);
        }
        const sellerItems = order.items?.filter(item => item.sellerId === user.uid) || [];
        return sum + sellerItems.reduce((s, i) => s + (Number(i.price) || 0), 0);
    }, 0);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2 uppercase">
                        Disbursement <span className="text-primary italic">Manager</span>
                    </h1>
                    <p className="text-text-muted font-bold flex items-center gap-2">
                        <ShoppingBag size={16} className="text-primary" />
                        Global transaction dashboard and clearance control.
                    </p>
                </div>

                <div className="flex items-center gap-3 glass px-6 py-4 rounded-3xl border border-primary/20 bg-primary/5">
                    <DollarSign size={20} className="text-primary" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Network Volume</span>
                        <span className="text-lg font-black text-text-primary">MK {totalVolume.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer, product, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 glass border-glass-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white/5"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'glass text-text-muted border border-glass-border hover:border-primary/40'
                                }`}
                        >
                            {f === 'approved' ? 'Success' : f === 'cancelled' ? 'Failed' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                    <p className="text-xs text-text-muted font-black uppercase tracking-widest">Scanning Ledger...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center glass-premium rounded-[44px] border border-glass-border">
                    <div className="w-24 h-24 rounded-[40px] bg-surface-2 flex items-center justify-center text-text-muted mb-8 border border-glass-border shadow-xl">
                        <ShoppingBag size={40} className="opacity-40" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-text-primary mb-3">No Transactions</h3>
                    <p className="max-w-xs text-sm text-text-muted font-medium leading-relaxed uppercase tracking-wider">
                        Zero streams detected in the current filter protocol.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} isAdmin={isAdmin} currentUserId={user.uid} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;

