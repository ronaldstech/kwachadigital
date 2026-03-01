import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Calendar,
    CheckCircle2,
    Clock,
    Search,
    User,
    Package,
    AlertCircle,
    ChevronDown,
    DollarSign,
    MoreVertical,
    CheckCircle,
    XCircle,
    Truck
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const OrderCard = ({ order, currentUserId, isAdmin }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    // If admin, show all items. Otherwise, show only items belonging to this seller.
    const displayItems = isAdmin
        ? (order.items || [])
        : (order.items?.filter(item => item.sellerId === currentUserId) || []);

    const displaySubtotal = isAdmin
        ? (order.total || 0)
        : displayItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            toast.success(`Order marked as ${newStatus}`);
        } catch (err) {
            console.error("Error updating order:", err);
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const statusStyles = {
        pending: "text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]",
        approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]",
        completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
        shipped: "text-blue-400 bg-blue-400/10 border-blue-400/20"
    };

    const currentStatusStyle = statusStyles[order.status?.toLowerCase()] || statusStyles.pending;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-premium p-6 rounded-[32px] border border-white/10 hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col h-full"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-20 ${order.status === 'approved' ? 'bg-emerald-500' : 'bg-primary'}`} />

            {/* Header: Customer Info & Status */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-primary border border-glass-border group-hover:bg-primary/10 transition-all">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-black text-text-primary tracking-tight mb-0.5 truncate max-w-[150px]">
                            {order.userName || 'Unknown Customer'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                <Calendar size={12} />
                                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${currentStatusStyle}`}>
                    {order.status?.toLowerCase() === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {order.status || 'Pending'}
                </div>
            </div>

            {/* Order Content */}
            <div className="flex-grow space-y-4 mb-6">
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                        {isAdmin ? 'Full Order Assets' : 'Your Assets'} ({displayItems.length})
                    </p>
                    <div className="space-y-2">
                        {displayItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 glass rounded-2xl border border-white/5">
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-2">
                                            <Package size={16} className="text-text-muted" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-text-primary truncate uppercase">{item.title}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">MK {Number(item.price).toLocaleString()}</p>
                                        {isAdmin && item.sellerId && (
                                            <span className="text-[8px] text-text-muted font-bold uppercase">Vendor: {item.sellerName || item.sellerId.slice(0, 5)}</span>
                                        )}
                                    </div>
                                    {order.status === 'approved' && item.fileUrl && (
                                        <div className="mt-2 text-right">
                                            <a
                                                href={item.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 hover:border-primary/30 transition-all shadow-sm border border-glass-border"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                Download
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 glass rounded-2xl border border-white/5 bg-primary/5">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{isAdmin ? 'Order Total' : 'Settlement Value'}</span>
                            <span className="text-xl font-display font-black text-text-primary">MK {displaySubtotal.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Order ID</span>
                            <p className="text-[10px] font-mono font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin/Seller Actions */}
            <div className="flex gap-2">
                {order.status !== 'approved' && order.status !== 'completed' && (
                    <button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={isUpdating}
                        className="flex-1 btn btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isUpdating ? <Clock className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                        Approve Order
                    </button>
                )}
                {(order.status === 'approved' || order.status === 'pending') && (
                    <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        disabled={isUpdating}
                        className="p-3.5 glass border-glass-border rounded-2xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        title="Cancel Order"
                    >
                        <XCircle size={18} />
                    </button>
                )}
                <button className="p-3.5 glass border-glass-border rounded-2xl text-text-muted hover:text-primary hover:bg-white/5 transition-all">
                    <MoreVertical size={18} />
                </button>
            </div>
        </motion.div>
    );
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!user) return;

        // If admin, fetch ALL orders. Otherwise, fetch only where user is a seller.
        const q = isAdmin
            ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
            : query(
                collection(db, 'orders'),
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
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isAdmin]);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalRevenue = orders.reduce((sum, order) => {
        if (isAdmin) {
            return sum + (Number(order.total) || 0);
        }
        const sellerItems = order.items?.filter(item => item.sellerId === user.uid) || [];
        return sum + sellerItems.reduce((s, i) => s + (Number(i.price) || 0), 0);
    }, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2 uppercase">
                        {isAdmin ? 'Global' : 'Client'} <span className="text-primary italic">Requests</span>
                    </h1>
                    <p className="text-text-muted font-bold flex items-center gap-2">
                        <ShoppingBag size={16} className="text-primary" />
                        Manage customer purchases and approve digital disbursements.
                    </p>
                </div>

                <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl border border-primary/20 bg-primary/5">
                    <DollarSign size={18} className="text-primary" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pending Clearance</span>
                        <span className="text-sm font-black text-text-primary">MK {totalRevenue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search by customer name or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 glass border-glass-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white/5 placeholder:text-text-muted/40"
                />
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="text-sm text-text-muted font-bold uppercase tracking-widest">Scanning Network...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-70">
                    <div className="w-24 h-24 rounded-[40px] bg-surface-2 flex items-center justify-center text-text-muted mb-8 border border-glass-border shadow-xl">
                        <AlertCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-display font-black text-text-primary mb-3">No Request Streams</h3>
                    <p className="max-w-sm text-sm text-text-muted font-medium leading-relaxed">
                        {searchTerm ? "No orders match your search criteria." : "You don't have any customer requests yet. Make sure your assets are active in the Digital Vault."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} currentUserId={user.uid} isAdmin={isAdmin} />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Orders;
