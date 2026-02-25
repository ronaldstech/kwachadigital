import React from 'react';
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
    ArrowUpRight
} from 'lucide-react';

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

const ActivityItem = ({ icon: Icon, title, time, status, amount }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-glass-border">
        <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-text-secondary border border-glass-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-text-primary mb-0.5">{title}</h4>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Clock size={10} />
                    {time}
                </span>
                <span className="w-1 h-1 rounded-full bg-text-muted/30" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {status}
                </span>
            </div>
        </div>
        {amount && (
            <div className="text-right">
                <span className="text-sm font-black text-text-primary">{amount}</span>
            </div>
        )}
    </div>
);

const Overview = ({ user }) => {
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
                    <p className="text-text-muted font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" />
                        Welcome back, {user?.name}. Your digital assets are secure.
                    </p>
                </div>

                <button className="btn btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] group self-start">
                    <Zap size={18} />
                    Deploy New Asset
                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={ShoppingBag}
                    label="Total Acquisitions"
                    value="12 Assets"
                    trend="+24%"
                    color="primary"
                />
                <StatCard
                    icon={Briefcase}
                    label="Active Licenses"
                    value="08 Active"
                    color="emerald-500"
                />
                <StatCard
                    icon={Download}
                    label="Stored Downloads"
                    value="1.2 GB"
                    trend="+5%"
                    color="blue-500"
                />
                <StatCard
                    icon={Eye}
                    label="Profile Reach"
                    value="2.4k Views"
                    trend="+112%"
                    color="purple-500"
                />
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
                        <ActivityItem
                            icon={ShoppingBag}
                            title="Modern UI Kit Pro Acquisition"
                            time="2 hours ago"
                            status="Completed"
                            amount="$49.00"
                        />
                        <ActivityItem
                            icon={Briefcase}
                            title="SaaS Dashboard Template Access"
                            time="Yesterday"
                            status="Completed"
                            amount="$79.00"
                        />
                        <ActivityItem
                            icon={CheckCircle2}
                            title="Security Protocol Update"
                            time="2 days ago"
                            status="Completed"
                        />
                        <ActivityItem
                            icon={Zap}
                            title="Beta Access Feature Unlock"
                            time="3 days ago"
                            status="Active"
                        />
                    </div>
                </div>

                {/* Quick Access / Profile Info */}
                <div className="glass-premium rounded-[40px] border-glass-border p-8">
                    <h2 className="text-xl font-display font-black text-text-primary tracking-tight mb-8">Quick Protocols</h2>

                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-primary/10 hover:border-primary/30 transition-all group text-left">
                            <span className="text-sm font-bold text-text-primary">Global Settings</span>
                            <ArrowUpRight size={18} className="text-text-muted group-hover:text-primary transition-all" />
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
                            <div className="p-6 rounded-[24px] bg-gradient-to-br from-primary/20 to-emerald-600/20 border border-primary/20 relative overflow-hidden">
                                <h4 className="text-sm font-black text-text-primary mb-2">Arcade+ Member</h4>
                                <p className="text-[10px] text-text-muted leading-relaxed uppercase tracking-wider font-bold">
                                    You have premium access to all digital vaults until Dec 2026.
                                </p>
                                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Overview;
