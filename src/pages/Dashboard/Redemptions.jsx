import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Loader2, Clock, CheckCircle, XCircle, Coins, Phone, ChevronDown } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';

const STATUS_STYLES = {
    pending: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: Clock },
    approved: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle },
    rejected: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: XCircle },
};

const Redemptions = () => {
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'redemptions'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setRedemptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, []);

    const handleStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await updateDoc(doc(db, 'redemptions', id), { status: newStatus });
            toast.success(`Redemption ${newStatus}.`, {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
            });
        } catch (err) {
            toast.error('Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filter === 'all' ? redemptions : redemptions.filter(r => r.status === filter);
    const totalPending = redemptions.filter(r => r.status === 'pending').reduce((s, r) => s + (r.amount || 0), 0);
    const totalPaid = redemptions.filter(r => r.status === 'approved').reduce((s, r) => s + (r.amount || 0), 0);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2">
                    Cash <span className="text-primary italic">Redemptions</span>
                </h1>
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <Wallet size={14} className="text-primary" />
                    Track and manage all user payout requests
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Requests', value: redemptions.length, icon: Wallet, color: 'primary' },
                    { label: 'Pending Payout', value: `MK ${totalPending.toLocaleString()}`, icon: Clock, color: 'amber' },
                    { label: 'Total Paid Out', value: `MK ${totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'emerald' },
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

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-primary text-white border-primary' : 'glass border-glass-border text-text-muted hover:text-text-primary'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-premium p-12 rounded-[40px] text-center border-white/5">
                    <Wallet size={32} className="text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-text-muted font-bold">No redemption requests found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((r, i) => {
                        const style = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                        const StatusIcon = style.icon;
                        const isPending = r.status === 'pending';
                        return (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="glass border border-glass-border rounded-[24px] p-5 flex flex-wrap items-center gap-4 hover:border-primary/20 transition-all"
                            >
                                {/* Status icon */}
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                                    <StatusIcon size={20} className={style.color} />
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-text-primary text-sm truncate">{r.userName || 'Unknown'}</p>
                                    <p className="text-[10px] text-text-muted font-bold truncate">{r.userEmail}</p>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl border border-glass-border">
                                    <Coins size={13} className="text-primary" />
                                    <span className="text-sm font-black text-primary">MK {(r.amount || 0).toLocaleString()}</span>
                                </div>

                                {/* Phone */}
                                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-text-muted font-bold">
                                    <Phone size={12} className="text-primary" />
                                    <span>{r.phone}</span>
                                    <span className="uppercase text-[9px] tracking-widest opacity-60">({r.network})</span>
                                </div>

                                {/* Status badge */}
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.color} ${style.bg} ${style.border}`}>
                                    {r.status}
                                </span>

                                {/* Date */}
                                <p className="hidden lg:block text-[10px] text-text-muted font-bold whitespace-nowrap">
                                    {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '—'}
                                </p>

                                {/* Admin actions for pending */}
                                {isPending && (
                                    <div className="flex gap-2 ml-auto">
                                        <button
                                            disabled={updatingId === r.id}
                                            onClick={() => handleStatus(r.id, 'approved')}
                                            className="px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                        >
                                            {updatingId === r.id ? <Loader2 size={12} className="animate-spin" /> : 'Approve'}
                                        </button>
                                        <button
                                            disabled={updatingId === r.id}
                                            onClick={() => handleStatus(r.id, 'rejected')}
                                            className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default Redemptions;
