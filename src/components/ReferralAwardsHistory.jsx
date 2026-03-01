import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Coins, Wallet, History, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS_STYLES = {
    pending: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: Clock },
    approved: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle },
    rejected: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: XCircle },
};

const ReferralAwardsHistory = ({ user }) => {
    const [referrals, setReferrals] = useState([]);
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        // Fetch Referrals (orders where referrerId === user.uid)
        const qRef = query(
            collection(db, 'orders'),
            where('referrerId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const unsubRef = onSnapshot(qRef, snap => {
            const refs = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'earned' }));
            setReferrals(refs);
            checkLoading();
        });

        // Fetch Redemptions (redemptions where userId === user.uid)
        const qRedeem = query(
            collection(db, 'redemptions'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const unsubRedeem = onSnapshot(qRedeem, snap => {
            const reds = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'redeemed' }));
            setRedemptions(reds);
            checkLoading();
        });

        let refDone = false;
        let redeemDone = false;
        const checkLoading = () => {
            if (unsubRef) refDone = true;
            if (unsubRedeem) redeemDone = true;
            if (refDone && redeemDone) setLoading(false);
        };

        return () => {
            unsubRef();
            unsubRedeem();
        };
    }, [user?.uid]);

    // Combine and sort by date descending
    const allHistory = [...referrals, ...redemptions].sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
    }).slice(0, 15); // Show latest 15 combined

    if (!user) return null;

    return (
        <div className="glass-premium rounded-[40px] border-glass-border p-6 sm:p-8 mt-8">
            <h4 className="text-sm font-black text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={16} className="text-primary" />
                Rewards Activity
            </h4>

            {loading ? (
                <div className="py-8 text-center text-text-muted text-[10px] uppercase tracking-widest font-bold animate-pulse">
                    Loading records...
                </div>
            ) : allHistory.length === 0 ? (
                <div className="py-12 text-center">
                    <History size={24} className="text-text-muted mx-auto mb-3 opacity-50" />
                    <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">No reward activity yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {allHistory.map((item, i) => {
                        const isEarned = item.type === 'earned';
                        const amount = isEarned ? (item.referralCommission || 0) : (item.amount || 0);

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass border border-glass-border rounded-2xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEarned ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                                        {isEarned ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-text-primary truncate mb-0.5">
                                            {isEarned
                                                ? `Purchase by ${item.userName || 'Guest'}`
                                                : `Payout (${item.network})`
                                            }
                                        </p>
                                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}

                                            {/* Show status if redemption */}
                                            {!isEarned && item.status && (
                                                <>
                                                    <span className="opacity-30">•</span>
                                                    <span className={STATUS_STYLES[item.status]?.color || 'text-amber-400'}>
                                                        {item.status}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className={`text-right ${isEarned ? 'text-primary' : 'text-text-primary'}`}>
                                    <p className="text-sm font-black flex items-center justify-end gap-1">
                                        {isEarned ? '+' : '-'} MK {amount.toLocaleString()}
                                    </p>
                                    {isEarned && item.items?.[0] && (
                                        <p className="text-[9px] text-text-muted font-bold truncate max-w-[100px]">
                                            {item.items[0].title}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReferralAwardsHistory;
