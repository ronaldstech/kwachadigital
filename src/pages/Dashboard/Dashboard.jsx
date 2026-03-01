import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingBag,
    Menu,
    X,
    Settings as SettingsIcon,
    Package,
    LogOut,
    Search,
    Bell,
    Zap,
    Sun,
    Moon,
    Users as UsersIcon,
    Wallet,
    User
} from 'lucide-react';
import {
    collection,
    query,
    where,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

import { useTheme } from '../../context/ThemeContext';

import { Link, useNavigate } from 'react-router-dom';

// Dashboard Sub-components
import Overview from './Overview';
import Products from './Products';
import Orders from './Orders';
import Settings from './Settings';
import Users from './Users';
import Redemptions from './Redemptions';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: UsersIcon, adminOnly: true },
    { id: 'redemptions', label: 'Redemptions', icon: Wallet, adminOnly: true },
    { id: 'settings', label: 'Profile', icon: User },
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const { isDark, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingRedemptions, setPendingRedemptions] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'admin') return;

        // Listen for Pending Products
        const qProducts = query(
            collection(db, 'products'),
            where('status', '==', 'Pending')
        );

        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
            setPendingCount(snapshot.size);
        });

        // Listen for Pending Redemptions
        const qRedemptions = query(
            collection(db, 'redemptions'),
            where('status', '==', 'pending')
        );

        const unsubRedemptions = onSnapshot(qRedemptions, (snapshot) => {
            setPendingRedemptions(snapshot.size);
        });

        return () => {
            unsubProducts();
            unsubRedemptions();
        };
    }, [user]);


    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Overview user={user} />;
            case 'products':
                return <Products />;
            case 'orders':
                return <Orders />;
            case 'users':
                return <Users />;
            case 'redemptions':
                return <Redemptions />;
            case 'settings':
                return <Settings user={user} />;
            default:
                return <Overview user={user} />;
        }
    };

    return (
        <div className="min-h-screen bg-bg-main flex relative overflow-x-hidden">
            {/* Background Blobs - Global for Dashboard */}
            <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
            <div className="fixed bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 border-r border-glass-border bg-bg-main/50 backdrop-blur-3xl z-40 p-6">
                <Link to="/" className="flex items-center gap-3 mb-12 px-2 no-underline group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
                        <Zap size={22} className="text-white transform group-hover:rotate-12 transition-transform" />
                    </div>
                    <span className="text-xl font-display font-bold text-text-primary tracking-tight">
                        Arcade<span className="text-primary">.</span>HQ
                    </span>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.2)]'
                                : 'text-text-muted hover:text-text-primary hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-primary' : 'group-hover:text-text-primary'}`} />
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>

                            {/* Product Badge */}
                            {item.id === 'products' && pendingCount > 0 && user?.role === 'admin' && (
                                <span className="ml-auto px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded-full shadow-lg shadow-primary/20 animate-pulse">
                                    {pendingCount}
                                </span>
                            )}

                            {/* Redemption Badge */}
                            {item.id === 'redemptions' && pendingRedemptions > 0 && user?.role === 'admin' && (
                                <span className="ml-auto px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-amber-500/20 animate-pulse">
                                    {pendingRedemptions}
                                </span>
                            )}

                            {activeTab === item.id && (
                                <motion.div layoutId="activeTabIndicator" className={`${(item.id === 'products' || item.id === 'redemptions') && user?.role === 'admin' ? 'hidden' : 'ml-auto'} w-1.5 h-1.5 rounded-full bg-primary`} />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    {/* Wallet/Points Quick Info */}
                    <Link to="/profile" onClick={() => setActiveTab('settings')} className="block group no-underline">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 hover:border-primary/40 transition-all relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Wallet size={64} className="text-primary" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                <Wallet size={12} /> Wallet Balance
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-black text-text-muted">MK</span>
                                <span className="text-xl font-display font-black text-text-primary">
                                    {(user?.points || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </Link>
                    {/* Theme Toggle Button - Desktop */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white/5 border border-glass-border hover:bg-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </div>
                            <span className="text-sm font-bold text-text-primary">
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
                            <motion.div
                                animate={{ x: isDark ? 16 : 2 }}
                                className={`absolute top-1 w-2 h-2 rounded-full ${isDark ? 'bg-amber-500' : 'bg-primary'}`}
                            />
                        </div>
                    </button>

                    <div className="pt-6 border-t border-glass-border">

                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                                {user?.avatar}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-text-primary truncate">{user?.name}</span>
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{user?.role}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
                        >
                            <LogOut size={20} />
                            <span className="text-sm font-bold">Terminate</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-bg-main border-b border-glass-border z-50 px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 no-underline">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                        <Zap size={16} />
                    </div>
                    <span className="font-display font-bold text-lg text-text-primary">Arcade</span>
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 glass rounded-xl border border-glass-border text-text-primary hover:text-primary transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2.5 glass rounded-xl border border-glass-border text-text-primary"
                    >
                        <Menu size={24} />
                    </button>
                </div>

            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-80 bg-bg-main z-[70] lg:hidden p-8 flex flex-col border-r border-glass-border"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <span className="text-xl font-display font-bold text-text-primary tracking-tight">Arcade<span className="text-primary italic">.</span>HQ</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 glass rounded-full border border-glass-border text-text-muted">
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-3">
                                {navItems.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                                            }`}
                                    >
                                        <item.icon size={22} />
                                        <span className="font-bold text-lg leading-none tracking-tight flex-1 flex items-center justify-between">
                                            {item.label}
                                            {item.id === 'products' && pendingCount > 0 && user?.role === 'admin' && (
                                                <span className="px-2 py-1 bg-white text-primary text-[10px] font-black rounded-full shadow-lg">
                                                    {pendingCount}
                                                </span>
                                            )}
                                            {item.id === 'redemptions' && pendingRedemptions > 0 && user?.role === 'admin' && (
                                                <span className="px-2 py-1 bg-white text-amber-500 text-[10px] font-black rounded-full shadow-lg">
                                                    {pendingRedemptions}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 space-y-4">
                                {/* Wallet Quick Info - Mobile */}
                                <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-10">
                                        <Wallet size={80} className="text-primary" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                        <Wallet size={14} /> Wallet Balance
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-black text-text-muted">MK</span>
                                        <span className="text-3xl font-display font-black text-text-primary">
                                            {(user?.points || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 mt-auto border-t border-glass-border">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold"
                                >
                                    <LogOut size={22} />
                                    <span>Logout Account</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen pt-24 lg:pt-12 p-6 lg:p-12 lg:ml-72">
                <div className="max-w-[1280px]">
                    {renderContent()}
                </div>
            </main>
        </div >
    );
};

export default Dashboard;
