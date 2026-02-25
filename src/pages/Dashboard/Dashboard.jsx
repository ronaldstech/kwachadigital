import React, { useState } from 'react';
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
    Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Dashboard Sub-components
import Overview from './Overview';
import Products from './Products';
import Orders from './Orders';
import Settings from './Settings';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

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
            <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-glass-border bg-bg-main/50 backdrop-blur-3xl z-40 p-6">
                <Link to="/" className="flex items-center gap-3 mb-12 px-2 no-underline group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
                        <Zap size={22} className="text-white transform group-hover:rotate-12 transition-transform" />
                    </div>
                    <span className="text-xl font-display font-bold text-text-primary tracking-tight">
                        Arcade<span className="text-primary">.</span>HQ
                    </span>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
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
                            {activeTab === item.id && (
                                <motion.div layoutId="activeTabIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-glass-border">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                            {user?.avatar}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-text-primary truncate">{user?.name}</span>
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Master Admin</span>
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
            </aside>

            {/* Mobile Navigation Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 glass-premium border-b border-glass-border z-50 px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 no-underline">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                        <Zap size={16} />
                    </div>
                    <span className="font-display font-bold text-lg text-text-primary">Arcade</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 glass rounded-xl border border-glass-border text-text-primary"
                >
                    <Menu size={24} />
                </button>
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
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                                            }`}
                                    >
                                        <item.icon size={22} />
                                        <span className="font-bold text-lg leading-none tracking-tight">{item.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="pt-8 border-t border-glass-border">
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
            <main className="flex-1 min-h-screen pt-24 lg:pt-12 p-6 lg:p-12">
                {/* Desktop Search & Notify Bar */}
                <div className="hidden lg:flex items-center justify-between mb-12 max-w-[1280px]">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Online: v4.0.2
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Global protocol search..."
                                className="w-full pl-11 pr-4 py-2.5 glass border-glass-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white/5"
                            />
                        </div>
                        <button className="p-3 glass rounded-xl border border-glass-border text-text-muted hover:text-primary transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-bg-main" />
                        </button>
                    </div>
                </div>

                <div className="max-w-[1280px]">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
