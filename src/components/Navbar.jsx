import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Search,
    LogIn,
    Menu,
    X,
    Rocket,
    Sun,
    Moon,
    ChevronRight,
    Home,
    Store,
    Briefcase,
    LayoutDashboard,
    User,
    LogOut,
    ChevronDown,
    Heart, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const prevScrollY = useRef(0);

    const { user, logout, openAuthModal } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { cart, favorites } = useStore();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Check if user is scrolled past top (for styling)
            setIsScrolled(currentScrollY > 40);

            // Hide on scroll down, show on scroll up
            if (currentScrollY > prevScrollY.current && currentScrollY > 150) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            prevScrollY.current = currentScrollY;
        };

        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Marketplace', path: '/marketplace', icon: Store },
        { name: 'Yazam', path: '/yazam', icon: Briefcase },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return (location.pathname + location.search).startsWith(path);
    };

    const handleLogout = async () => {
        setIsProfileOpen(false);
        await logout();
        navigate('/');
    };

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{
                y: isVisible ? 0 : -120,
                opacity: isVisible ? 1 : 0
            }}
            transition={{
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1]
            }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 md:pt-6 px-4 pointer-events-none"
        >
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`
                    pointer-events-auto
                    flex items-center justify-between
                    transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1)
                    w-full max-w-[1280px]
                    ${isScrolled
                        ? 'rounded-full glass glass-premium px-8 md:px-10 py-3 shadow-2xl translate-y-2'
                        : 'rounded-2xl glass px-8 md:px-10 py-5 translate-y-2'
                    }
                `}
            >
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 md:gap-3 no-underline group shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-md opacity-40 group-hover:opacity-80 transition-opacity" />
                        <div className="relative w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
                            <Rocket size={18} className="md:w-[22px] text-white transform group-hover:rotate-12 transition-transform" />
                        </div>
                    </div>
                    <span className="text-base md:text-xl font-display font-bold text-text-primary tracking-tight">
                        Kwacha<span className="text-primary italic">.</span>Digital
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
                    {navLinks.map((link, i) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`relative group py-2 flex items-center gap-2.5 transition-all duration-300 ${isActive(link.path) ? 'scale-105' : 'hover:scale-105'}`}
                        >
                            <link.icon size={16} className={`transition-colors duration-300 ${isActive(link.path) ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`} />
                            <span className={`text-[12px] lg:text-[13px] font-black uppercase tracking-wider transition-colors duration-300 ${isActive(link.path) ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                {link.name}
                            </span>
                            {isActive(link.path) && (
                                <motion.div
                                    layoutId="navUnderline"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 md:gap-2 ml-auto">
                    <div className="hidden sm:flex items-center glass rounded-full p-1 border border-glass-border">
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 md:p-2 text-text-secondary hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-white/5"
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={16} className="md:w-[18px]" /> : <Moon size={16} className="md:w-[18px]" />}
                        </button>
                        <div className="w-px h-3 md:h-4 bg-glass-border mx-1" />
                        <button className="p-1.5 md:p-2 text-text-secondary hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-white/5">
                            <Search size={16} className="md:w-[18px]" />
                        </button>
                    </div>

                    <Link to="/cart" className="relative p-1.5 md:p-2.5 text-text-secondary hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-white/5">
                        <ShoppingCart size={18} className="md:w-[20px]" />
                        {cart.length > 0 && (
                            <span className="absolute top-1 md:top-1.5 right-1 md:right-1.5 w-3.5 md:w-4 h-3.5 md:h-4 bg-primary text-[8px] md:text-[9px] font-bold text-white flex items-center justify-center rounded-full border border-white/20">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    <Link to="/favorites" className="relative hidden sm:flex p-1.5 md:p-2.5 text-text-secondary hover:text-secondary transition-colors items-center justify-center rounded-full hover:bg-white/5">
                        <Heart size={18} className="md:w-[20px]" />
                        {favorites.length > 0 && (
                            <span className="absolute top-1 md:top-1.5 right-1 md:right-1.5 w-3.5 md:w-4 h-3.5 md:h-4 bg-secondary text-[8px] md:text-[9px] font-bold text-white flex items-center justify-center rounded-full border border-white/20">
                                {favorites.length}
                            </span>
                        )}
                    </Link>


                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="hidden sm:flex items-center gap-2 pl-2 md:pl-3 p-1 glass rounded-full hover:bg-white/10 border border-glass-border transition-all group"
                            >
                                <span className="text-[11px] md:text-xs font-bold text-text-primary hidden lg:block">{user.name.split(' ')[0]}</span>
                                <div className="w-7 md:w-8 h-7 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                                    {user.avatar}
                                </div>
                                <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-64 z-50 bg-bg-main/100 backdrop-blur-2xl rounded-[28px] border border-glass-border shadow-2xl overflow-hidden py-3 p-2 pointer-events-auto"
                                    >
                                        <div className="px-4 py-3 mb-2 border-b border-glass-border/50">
                                            <p className="text-[10px] uppercase tracking-widest font-black text-text-muted mb-1">Signed in as</p>
                                            <p className="text-sm font-bold text-text-primary truncate">{user.email}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-3 px-4 py-1 rounded-2xl hover:bg-primary/10 text-text-secondary hover:text-primary transition-all group no-underline"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                    <LayoutDashboard size={16} />
                                                </div>
                                                <span className="text-sm font-bold">Control Center</span>
                                            </Link>

                                            <Link
                                                to="/orders"
                                                className="flex items-center gap-3 px-4 py-1 rounded-2xl hover:bg-emerald-500/10 text-text-secondary hover:text-emerald-500 transition-all group no-underline"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                                    <ShoppingBag size={16} />
                                                </div>
                                                <span className="text-sm font-bold">My Orders</span>
                                            </Link>

                                            <Link
                                                to="/favorites"
                                                className="flex items-center gap-3 px-4 py-1 rounded-2xl hover:bg-secondary/10 text-text-secondary hover:text-secondary transition-all group no-underline"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
                                                    <Heart size={16} />
                                                </div>
                                                <span className="text-sm font-bold">Favorites</span>
                                            </Link>

                                            <div className="h-px bg-glass-border/50 my-2 mx-2" />

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-1 rounded-2xl bg-red-500/20 text-text-secondary hover:text-red-500 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                                                    <LogOut size={16} />
                                                </div>
                                                <span className="text-sm font-bold">Logout</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            onClick={() => openAuthModal('signup')}
                            className="btn btn-primary hidden sm:flex py-1.5 md:py-2 px-4 md:px-6 text-[11px] md:text-xs rounded-full ml-1 md:ml-2"
                        >
                            Join Now
                        </button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden ml-1 p-1.5 text-text-primary hover:text-primary transition-colors pointer-events-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                        }}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay - Side Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md md:hidden pointer-events-auto"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 w-[310px] z-50 bg-bg-main/80 backdrop-blur-2xl border-l border-glass-border shadow-[-20px_0_50px_rgba(0,0,0,0.2)] md:hidden flex flex-col pointer-events-auto overflow-hidden"
                        >
                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
                                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                                <div className="absolute bottom-[20%] left-[-20%] w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />
                            </div>

                            {/* Drawer Header */}
                            <div className="p-4 pt-5 flex items-center justify-between border-b border-glass-border">
                                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg">
                                        <Rocket size={16} className="text-white" />
                                    </div>
                                    <span className="font-display font-bold text-lg text-text-primary tracking-tight">Kwacha</span>
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-10 h-10 rounded-full glass border border-glass-border flex items-center justify-center text-text-primary hover:text-primary transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <div className="flex flex-col gap-1">
                                    {navLinks.map((link, i) => (
                                        <motion.div
                                            key={link.name}
                                            initial={{ x: 30, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 + (i * 0.08), ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <Link
                                                to={link.path}
                                                className={`group text-lg font-display font-bold no-underline flex items-center justify-between py-2 px-2 rounded-2xl transition-all ${isActive(link.path) ? 'bg-primary/10 text-primary border border-primary/10' : 'text-text-primary hover:bg-white/5 border border-transparent'}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive(link.path) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-2 text-text-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                        <link.icon size={20} />
                                                    </div>
                                                    {link.name}
                                                </div>
                                                <ChevronRight size={18} className={`transition-transform duration-300 ${isActive(link.path) ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                            </Link>
                                        </motion.div>
                                    ))}

                                    <div className="h-px bg-glass-border my-8 mx-2" />

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex flex-col gap-6"
                                    >
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold mb-4 ml-2">Preferences</p>
                                            <div className="flex items-center justify-between p-4 glass rounded-2xl border border-glass-border h-16">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-text-primary">Interface Theme</span>
                                                    <span className="text-[10px] text-text-muted">{isDark ? 'Dark mode active' : 'Light mode active'}</span>
                                                </div>
                                                <button
                                                    onClick={toggleTheme}
                                                    className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold mb-4 ml-2">Account</p>
                                            {user ? (
                                                <div className="flex flex-col gap-1">
                                                    <Link
                                                        to="/dashboard"
                                                        className="flex items-center gap-2 p-2 glass rounded-2xl border border-glass-border hover:bg-primary/5 transition-all no-underline group"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                                                            <LayoutDashboard size={20} />
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-sm font-bold text-text-primary">Dashboard</span>
                                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Control Center</span>
                                                        </div>
                                                        <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                                    </Link>

                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-2 p-2 glass rounded-2xl border border-glass-border hover:bg-primary/5 transition-all no-underline group"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                                                            <User size={20} />
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-sm font-bold text-text-primary">Profile</span>
                                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Founder Stats</span>
                                                        </div>
                                                        <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                                    </Link>

                                                    <Link
                                                        to="/orders"
                                                        className="flex items-center gap-2 p-2 glass rounded-2xl border border-glass-border hover:bg-emerald-500/5 transition-all no-underline group"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg font-bold text-emerald-500 border border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform">
                                                            <ShoppingBag size={20} />
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-sm font-bold text-text-primary">My Orders</span>
                                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Purchase History</span>
                                                        </div>
                                                        <ChevronRight size={16} className="text-text-muted group-hover:text-emerald-500 transition-colors" />
                                                    </Link>

                                                    <Link
                                                        to="/favorites"
                                                        className="flex items-center gap-2 p-2 glass rounded-2xl border border-glass-border hover:bg-secondary/5 transition-all no-underline group"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <div className="relative w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-inner group-hover:scale-105 transition-transform">
                                                            <Heart size={20} />
                                                            {favorites.length > 0 && (
                                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-[9px] font-bold text-white flex items-center justify-center rounded-full border border-white/20">
                                                                    {favorites.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-sm font-bold text-text-primary">Favorites</span>
                                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Saved Assets</span>
                                                        </div>
                                                        <ChevronRight size={16} className="text-text-muted group-hover:text-secondary transition-colors" />
                                                    </Link>

                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-2 p-2 glass rounded-2xl border border-glass-border bg-red-500/30 hover:bg-red-500/20 transition-all group"
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-text-secondary border border-glass-border group-hover:bg-red-500 group-hover:text-white transition-all">
                                                            <LogOut size={20} />
                                                        </div>
                                                        <span className="text-sm font-bold text-text-primary group-hover:text-red-500">Sign Out</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <Link
                                                        to="/favorites"
                                                        className="flex items-center gap-4 p-4 glass rounded-2xl border border-glass-border hover:bg-secondary/5 transition-all no-underline group"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <div className="relative w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-inner group-hover:scale-105 transition-transform">
                                                            <Heart size={20} />
                                                            {favorites.length > 0 && (
                                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-[9px] font-bold text-white flex items-center justify-center rounded-full border border-white/20">
                                                                    {favorites.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-sm font-bold text-text-primary">Favorites</span>
                                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Saved Assets</span>
                                                        </div>
                                                        <ChevronRight size={16} className="text-text-muted group-hover:text-secondary transition-colors" />
                                                    </Link>
                                                    <button
                                                        onClick={() => { setIsMobileMenuOpen(false); openAuthModal('login'); }}
                                                        className="w-full flex items-center gap-4 p-4 glass rounded-2xl border border-glass-border hover:bg-primary/5 transition-all group"
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-text-secondary border border-glass-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                            <LogIn size={22} />
                                                        </div>
                                                        <div className="flex flex-col items-start translate-y-[-1px]">
                                                            <span className="text-sm font-bold text-text-primary">Sign In</span>
                                                            <span className="text-[10px] text-text-muted">Access your digital vault</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            to={user ? "/sell" : "/login"}
                                            className="btn btn-primary w-full text-base py-4 rounded-2xl shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] flex items-center gap-2 group mb-6"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {user ? 'Sell Digital Asset' : 'Start Creating'}
                                            <motion.div
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <ChevronRight size={18} />
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Navbar;
