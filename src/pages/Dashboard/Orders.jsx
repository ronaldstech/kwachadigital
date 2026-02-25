import React from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Search,
    ExternalLink,
    Shield
} from 'lucide-react';

const OrderCard = ({ order }) => (
    <div className="glass-premium p-6 rounded-[32px] border-glass-border hover:border-primary/20 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -z-10" />

        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-primary border border-glass-border group-hover:bg-primary/10 transition-all">
                    <ShoppingBag size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-display font-black text-text-primary tracking-tight mb-1">{order.productName}</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                            <Calendar size={12} />
                            {order.date}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-text-muted/30" />
                        <span className="text-[10px] text-primary font-black uppercase tracking-widest">{order.orderId}</span>
                    </div>
                </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${order.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                {order.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {order.status}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 glass rounded-2xl border border-glass-border">
                <p className="text-[10px] uppercase font-black text-text-muted mb-1">Acquisition Price</p>
                <p className="text-base font-black text-text-primary">{order.price}</p>
            </div>
            <div className="p-4 glass rounded-2xl border border-glass-border">
                <p className="text-[10px] uppercase font-black text-text-muted mb-1">License Type</p>
                <p className="text-base font-black text-text-primary">{order.license}</p>
            </div>
        </div>

        <div className="flex gap-3">
            <button className="flex-1 btn btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-primary/20 group/btn">
                <Download size={16} />
                Access Vault
            </button>
            <button className="p-3.5 glass border-glass-border rounded-2xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all">
                <ExternalLink size={18} />
            </button>
        </div>
    </div>
);

const Orders = () => {
    const orders = [
        {
            id: 1,
            orderId: 'KW-9281-X',
            productName: 'Modern UI Kit Pro',
            date: 'Feb 24, 2026',
            price: '$49.00',
            status: 'Completed',
            license: 'Commercial'
        },
        {
            id: 2,
            orderId: 'KW-4412-A',
            productName: 'SaaS Dashboard Template',
            date: 'Feb 22, 2026',
            price: '$79.00',
            status: 'Completed',
            license: 'Single Use'
        },
        {
            id: 3,
            orderId: 'KW-1033-Q',
            productName: 'Mobile App Wireframe Kit',
            date: 'Feb 15, 2026',
            price: '$35.00',
            status: 'Processing',
            license: 'Personal'
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2">
                        Acquisition <span className="text-primary italic">Logs</span>
                    </h1>
                    <p className="text-text-muted font-bold flex items-center gap-2">
                        <ShoppingBag size={16} className="text-primary" />
                        Review your digital inventory and download original assets.
                    </p>
                </div>

                <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                    <Shield size={18} className="text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Total Spent</span>
                        <span className="text-sm font-black text-text-primary">$163.00</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search by order ID or product name..."
                    className="w-full pl-12 pr-4 py-3.5 glass border-glass-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white/5"
                />
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                    <div className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center text-text-muted mb-6 border border-glass-border">
                        <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No acquisitions found</h3>
                    <p className="max-w-xs text-sm text-text-muted font-bold">Start exploring the marketplace to build your digital inventory.</p>
                </div>
            )}
        </motion.div>
    );
};

export default Orders;
