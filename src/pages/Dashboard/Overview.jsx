import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Briefcase,
    Download,
    Eye,
    Clock,
    CheckCircle2,
    Zap,
    TrendingUp,
    ArrowUpRight,
    Users as UsersIcon,
    Coins,
    Loader2,
    AlertCircle
} from 'lucide-react';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore';
import { db } from '../../firebase';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-premium p-6 rounded-[32px] border-glass-border relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 rounded-full blur-[40px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity`} />

        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color} border border-${color}/20`}>
                <Icon size={22} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    <TrendingUp size={12} />
                    {trend}
                </div>
            )}
        </div>

        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-display font-black text-text-primary tracking-tight">{value}</h3>
    </motion.div>
);

const ActivityItem = ({ icon: Icon, title, time, status, amount, type }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-glass-border">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-glass-border transition-all ${type === 'redemption'
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            : 'bg-primary/10 text-primary border-primary/20'
            }`}>
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-text-primary mb-0.5 truncate">{title}</h4>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Clock size={10} />
                    {time}
                </span>
                <span className="w-1 h-1 rounded-full bg-text-muted/30" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'approved'
                    ? 'text-emerald-500'
                    : status?.toLowerCase() === 'pending'
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }`}>
                    {status}
                </span>
            </div>
        </div>
        {amount && (
            <div className="text-right">
                <span className={`text-sm font-black ${type === 'redemption' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {type === 'redemption' ? '-' : '+'} {amount}
                </span>
            </div>
        )}
    </div>
);

const Overview = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalUsers: 0,
        totalOrders: 0,
        pendingTasks: 0,
        userOrders: 0,
        userPoints: 0,
        activeAssets: 0,
        rewardsEarned: 0
    });
    const [activities, setActivities] = useState([]);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!user?.uid) return;

        const unsubs = [];

        // --- Data Fetching Logic ---

        if (isAdmin) {
            // Admin: Listen to all orders for total revenue
            const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
            unsubs.push(onSnapshot(qOrders, (snapshot) => {
                const orders = snapshot.docs.map(doc => doc.data());
                const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
                setStats(prev => ({
                    ...prev,
                    totalRevenue: revenue,
                    totalOrders: snapshot.size
                }));
            }));

            // Admin: Listen to users
            const qUsers = query(collection(db, 'users'));
            unsubs.push(onSnapshot(qUsers, (snapshot) => {
                setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
            }));

            // Admin: Pending Tasks (Pending Products + Pending Redemptions)
            const qPendingProducts = query(collection(db, 'products'), where('status', '==', 'Pending'));
            const qPendingRedemptions = query(collection(db, 'redemptions'), where('status', '==', 'pending'));

            unsubs.push(onSnapshot(qPendingProducts, (snap) => {
                setStats(prev => ({ ...prev, pProducts: snap.size }));
            }));
            unsubs.push(onSnapshot(qPendingRedemptions, (snap) => {
                setStats(prev => ({ ...prev, pRedemptions: snap.size }));
            }));
        } else {
            // User: Personal Orders
            const qUserOrders = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
            unsubs.push(onSnapshot(qUserOrders, (snapshot) => {
                setStats(prev => ({
                    ...prev,
                    userOrders: snapshot.size,
                    activeAssets: snapshot.size
                }));
            }));

            // User: Referral Points (Real-time points is already in user prop, but we can track earned history here if needed)
            // For now, user.points is sufficient.
        }

        // --- Activity Ledger (Combined Latest Orders and Redemptions) ---
        const qRecentOrders = isAdmin
            ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5))
            : query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));

        const qRecentRedemptions = isAdmin
            ? query(collection(db, 'redemptions'), orderBy('createdAt', 'desc'), limit(5))
            : query(collection(db, 'redemptions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));

        let currentOrders = [];
        let currentRedemptions = [];

        const updateActivities = () => {
            const combined = [
                ...currentOrders.map(o => ({
                    id: o.id,
                    type: 'order',
                    title: o.products?.[0]?.name || 'Asset Acquisition',
                    time: o.createdAt?.toDate ? new Date(o.createdAt.toDate()).toLocaleDateString() : 'Just now',
                    status: 'Completed',
                    amount: `MK ${o.total?.toLocaleString()}`,
                    icon: ShoppingBag,
                    timestamp: o.createdAt?.toMillis ? o.createdAt.toMillis() : Date.now()
                })),
                ...currentRedemptions.map(r => ({
                    id: r.id,
                    type: 'redemption',
                    title: `Payout (${r.network})`,
                    time: r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString() : 'Pending',
                    status: r.status,
                    amount: `MK ${r.amount?.toLocaleString()}`,
                    icon: Wallet,
                    timestamp: r.createdAt?.toMillis ? r.createdAt.toMillis() : Date.now()
                }))
            ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

            setActivities(combined);
            setLoading(false);
        };

        unsubs.push(onSnapshot(qRecentOrders, (snap) => {
            currentOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            updateActivities();
        }));

        unsubs.push(onSnapshot(qRecentRedemptions, (snap) => {
            currentRedemptions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            updateActivities();
        }));

        return () => unsubs.forEach(unsub => unsub());
    }, [user, isAdmin]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
                <p className="text-text-muted font-bold animate-pulse">Synchronizing Data Node...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2">
                        Arcade <span className="text-primary italic">Control</span>
                    </h1>
                    <p className="text-text-muted font-bold flex items-center gap-2 text-sm sm:text-base">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        Welcome back, {user?.name}. Your digital assets are secure.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start">
                    <button className="btn btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] group whitespace-nowrap">
                        <Zap size={18} />
                        Deploy New Asset
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isAdmin ? (
                    <>
                        <StatCard
                            icon={Coins}
                            label="Total Revenue"
                            value={`MK ${(stats.totalRevenue || 0).toLocaleString()}`}
                            trend="+12%"
                            color="primary"
                        />
                        <StatCard
                            icon={UsersIcon}
                            label="Platform Users"
                            value={`${stats.totalUsers} Active`}
                            color="purple-500"
                        />
                        <StatCard
                            icon={ShoppingBag}
                            label="Global Orders"
                            value={`${stats.totalOrders} Units`}
                            trend="+24%"
                            color="blue-500"
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="Pending Tasks"
                            value={`${(stats.pProducts || 0) + (stats.pRedemptions || 0)} Req.`}
                            color="amber-500"
                        />
                    </>
                ) : (
                    <>
                        <StatCard
                            icon={ShoppingBag}
                            label="My Acquisitions"
                            value={`${stats.userOrders} Assets`}
                            trend="+2%"
                            color="primary"
                        />
                        <StatCard
                            icon={Coins}
                            label="Reward Wallet"
                            value={`MK ${(user?.points || 0).toLocaleString()}`}
                            color="emerald-500"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Referral Reach"
                            value="Premium"
                            trend="+15%"
                            color="blue-500"
                        />
                        <StatCard
                            icon={Briefcase}
                            label="Active Licenses"
                            value={`${stats.activeAssets} Ready`}
                            color="purple-500"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="xl:col-span-2 glass-premium rounded-[40px] border-glass-border p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-display font-black text-text-primary tracking-tight flex items-center gap-3">
                            <Clock className="text-primary" size={22} />
                            Binary Ledger
                        </h2>
                        <button className="text-[10px] uppercase tracking-widest font-black text-primary hover:underline">
                            View Full History
                        </button>
                    </div>

                    <div className="space-y-2">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <ActivityItem
                                    key={activity.id}
                                    icon={activity.icon}
                                    title={activity.title}
                                    time={activity.time}
                                    status={activity.status}
                                    amount={activity.amount}
                                    type={activity.type}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <AlertCircle size={32} className="text-text-muted mx-auto mb-4 opacity-20" />
                                <p className="text-text-muted font-bold text-sm">No recent transactions recorded in the ledger.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Access / Profile Info */}
                <div className="glass-premium rounded-[40px] border-glass-border p-8">
                    <h2 className="text-xl font-display font-black text-text-primary tracking-tight mb-8">Quick Protocols</h2>

                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-primary/10 hover:border-primary/30 transition-all group text-left">
                            <span className="text-sm font-bold text-text-primary">Direct Messages</span>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">Alpha</span>
                                <ArrowUpRight size={18} className="text-text-muted group-hover:text-primary transition-all" />
                            </div>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-primary/10 hover:border-primary/30 transition-all group text-left">
                            <span className="text-sm font-bold text-text-primary">Link Hardware</span>
                            <ArrowUpRight size={18} className="text-text-muted group-hover:text-primary transition-all" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-primary/10 hover:border-primary/30 transition-all group text-left">
                            <span className="text-sm font-bold text-text-primary">Support Uplink</span>
                            <ArrowUpRight size={18} className="text-text-muted group-hover:text-primary transition-all" />
                        </button>

                        <div className="mt-8 pt-8 border-t border-glass-border">
                            <div className={`p-6 rounded-[24px] border relative overflow-hidden ${isAdmin
                                ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/20'
                                : 'bg-gradient-to-br from-primary/20 to-emerald-600/20 border-primary/20'
                                }`}>
                                <h4 className="text-sm font-black text-text-primary mb-2">
                                    {isAdmin ? 'System Superuser' : 'Arcade Member'}
                                </h4>
                                <p className="text-[10px] text-text-muted leading-relaxed uppercase tracking-wider font-bold">
                                    {isAdmin
                                        ? 'You have full access to global vault configurations and user security layers.'
                                        : 'You have active access to all digital vaults until Dec 2026.'
                                    }
                                </p>
                                <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-50 ${isAdmin ? 'bg-amber-500/20' : 'bg-primary/20'
                                    }`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Overview;
