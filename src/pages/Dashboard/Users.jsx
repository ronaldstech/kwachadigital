import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Search, ShieldCheck, Loader2, Coins, ShoppingBag, Star } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, []);

    const filtered = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPoints = users.reduce((s, u) => s + (u.points || 0), 0);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2">
                    System <span className="text-primary italic">Users</span>
                </h1>
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <UsersIcon size={14} className="text-primary" />
                    All registered accounts and their stats
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Users', value: users.length, icon: UsersIcon, color: 'primary' },
                    { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, color: 'amber' },
                    { label: 'Total Points Held', value: `MK ${totalPoints.toLocaleString()}`, icon: Coins, color: 'emerald' },
                ].map(stat => (
                    <div key={stat.label} className="glass-premium rounded-[28px] border border-glass-border p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : stat.color === 'amber' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-display font-black text-text-primary">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-12 pr-5 py-4 glass border border-glass-border rounded-2xl text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 bg-white/5 placeholder:text-text-muted/40 transition-colors"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-premium p-12 rounded-[40px] text-center border-white/5">
                    <UsersIcon size={32} className="text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-text-muted font-bold">No users found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((u, i) => (
                        <motion.div
                            key={u.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="glass border border-glass-border rounded-[24px] p-5 flex items-center gap-4 hover:border-primary/20 transition-all"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm shrink-0">
                                {(u.avatar || (u.name || u.email || 'KD').slice(0, 2)).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-text-primary text-sm truncate">{u.name || 'Unnamed'}</p>
                                <p className="text-[10px] text-text-muted font-bold truncate">{u.email}</p>
                            </div>

                            {/* Role badge */}
                            <span className={`hidden sm:flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-primary bg-primary/10 border-primary/20'}`}>
                                {u.role || 'user'}
                            </span>

                            {/* Points */}
                            <div className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl border border-glass-border">
                                <Coins size={13} className="text-primary" />
                                <span className="text-xs font-black text-text-primary">MK {(u.points || 0).toLocaleString()}</span>
                            </div>

                            {/* Date */}
                            <p className="hidden md:block text-[10px] text-text-muted font-bold whitespace-nowrap">
                                {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : '—'}
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Users;
