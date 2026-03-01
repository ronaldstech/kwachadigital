import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Zap, Shield, Globe, Rocket, CheckCircle,
    Star, CreditCard, Target, Inbox, Sparkles, Trophy,
    ZapOff, ChevronRight, Activity
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import SmartHeroSlideshow from '../components/SmartHeroSlideshow';
import { TICKER_ITEMS } from '../constants';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const LucideIcons = { CreditCard, Target, Inbox, Zap, Star, Shield, Globe, Rocket, CheckCircle };

// --- Enhanced Sub-Components ---

const MagneticButton = ({ children, className, variant = "primary" }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
        >
            <div className={`absolute -inset-0.5 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 
                ${variant === "primary" ? "bg-primary" : "bg-white/20"}`} />
            {children}
        </motion.div>
    );
};

const TickerItem = ({ item, isReverse = false }) => {
    const Icon = LucideIcons[item.icon] || LucideIcons.Zap;
    return (
        <div className={`flex items-center gap-5 glass-premium px-8 py-4 rounded-[24px] border border-white/10 shadow-2xl transition-all duration-500 hover:border-primary/40 group ${isReverse ? 'opacity-70 hover:opacity-100' : ''}`}>
            <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`relative p-3 rounded-xl bg-surface-1 border border-white/5 text-primary shadow-inner group-hover:scale-110 transition-transform`} style={{ color: item.color }}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-black text-text-primary tracking-tight">{item.name}</span>
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{item.time}</span>
            </div>
        </div>
    );
};

const CardSkeleton = () => (
    <div className="glass-premium rounded-[32px] overflow-hidden border border-white/10 animate-pulse">
        <div className="aspect-[4/5] bg-white/5" />
        <div className="p-8 space-y-4">
            <div className="h-4 bg-white/10 rounded-full w-2/3" />
            <div className="h-3 bg-white/5 rounded-full w-full" />
            <div className="h-12 bg-white/10 rounded-2xl w-full mt-4" />
        </div>
    </div>
);

// --- Main Page Component ---

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(
                    collection(db, 'products'),
                    where('status', '==', 'Approved'),
                    orderBy('createdAt', 'desc'),
                    limit(4)
                );
                const snap = await getDocs(q);
                setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="bg-bg-main selection:bg-primary/30 selection:text-primary">
            {/* Mesh Background Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0,transparent_70%)]" />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-24 md:pt-32 overflow-hidden">
                <div className="container relative z-10 px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                        <motion.div
                            style={{ y: yHero }}
                            className="flex-1 text-center lg:text-left pt-8 md:pt-12"
                        >
                            {/* Animated Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 glass-premium rounded-full border border-white/10 mb-6 md:mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                            >
                                <div className="flex h-1.5 w-1.5 md:h-2 md:w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-primary"></span>
                                </div>
                                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-text-primary">
                                    Marketplace Live v2.0
                                </span>
                            </motion.div>

                            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-display font-[950] text-text-primary mb-6 md:mb-8 leading-[0.9] tracking-tighter">
                                Build Your <br />
                                <span className="text-gradient-primary italic">Legacy.</span>
                            </h1>

                            <p className="text-lg sm:text-xl md:text-2xl text-text-secondary mb-8 md:mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-80 px-2 md:px-0">
                                The premier destination to acquire high-yield digital assets and hire top-tier creative engineering talent.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 justify-center lg:justify-start">
                                <Link to="/marketplace" className="w-full sm:w-auto">
                                    <MagneticButton>
                                        <div className="bg-primary text-white px-8 md:px-10 py-4 md:py-5 rounded-[18px] md:rounded-[22px] flex items-center justify-center sm:justify-start gap-3 font-black text-base md:text-lg shadow-2xl transition-transform active:scale-95 w-full">
                                            Start Exploring
                                            <ArrowRight size={20} className="md:w-[22px] md:h-[22px]" />
                                        </div>
                                    </MagneticButton>
                                </Link>

                                <Link to="/sell" className="group flex items-center justify-center sm:justify-start gap-3 px-8 md:px-10 py-4 md:py-5 rounded-[18px] md:rounded-[22px] glass border border-white/10 font-bold text-text-primary hover:bg-white/5 transition-all w-full sm:w-auto">
                                    List an Asset
                                    <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform md:w-[20px] md:h-[20px]" />
                                </Link>
                            </div>

                            {/* Enhanced Trust Bar */}
                            <div className="mt-12 md:mt-20 pt-8 md:pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center gap-6 md:gap-8 justify-center lg:justify-start">
                                <div className="flex -space-x-3 md:-space-x-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ y: -5, zIndex: 10 }}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border-2 border-bg-main bg-surface-2 glass flex items-center justify-center font-bold text-[10px] md:text-xs text-primary shadow-xl cursor-pointer"
                                        >
                                            {String.fromCharCode(64 + i)}
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-primary text-primary md:w-[14px] md:h-[14px]" />)}
                                        <span className="ml-2 text-xs md:text-sm font-black text-text-primary">4.9/5</span>
                                    </div>
                                    <p className="text-[9px] md:text-[11px] font-bold text-text-muted uppercase tracking-[0.15em] md:tracking-[0.2em]">
                                        Trusted by <span className="text-primary">8,000+</span> Industry Leaders
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex-1 relative w-full lg:w-auto h-[400px] sm:h-[500px] lg:h-[600px] mt-8 lg:mt-0">
                            <SmartHeroSlideshow />
                            {/* Decorative Floating Card */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 glass-premium p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl hidden md:block"
                            >
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-primary/20 rounded-xl md:rounded-2xl text-primary">
                                        <Activity size={20} className="md:w-[24px] md:h-[24px]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-text-muted">Market Volume</p>
                                        <p className="text-lg md:text-xl font-black text-text-primary">+124.5%</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cinematic Ticker */}
            <div className="py-8 md:py-12 border-y border-white/5 bg-surface-1/30 backdrop-blur-md relative overflow-hidden">
                <div className="flex animate-scroll-ticker gap-4 md:gap-8 whitespace-nowrap mb-4 md:mb-8 px-4">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
                        <TickerItem key={`top-${idx}`} item={item} />
                    ))}
                </div>
                <div className="flex animate-scroll-ticker-reverse gap-4 md:gap-8 whitespace-nowrap px-4">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].reverse().map((item, idx) => (
                        <TickerItem key={`bot-${idx}`} item={item} isReverse />
                    ))}
                </div>
            </div>

            {/* Featured Grid Section */}
            <section className="py-20 md:py-32 container relative px-4 md:px-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 md:mb-20 gap-6 md:gap-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className="h-[1px] w-8 md:w-12 bg-primary/50" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-primary">Curated Masterpieces</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-text-primary tracking-tighter leading-none">
                            High-Performance <br className="hidden sm:block" />
                            <span className="text-gradient-secondary">Digital Inventory</span>
                        </h2>
                    </div>
                    <Link to="/marketplace" className="group px-6 md:px-8 py-3 md:py-4 rounded-[18px] md:rounded-2xl glass border border-white/10 hover:border-primary/40 text-[11px] md:text-sm font-black uppercase tracking-widest transition-all w-full sm:w-auto text-center">
                        Browse Full Catalog
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    <AnimatePresence>
                        {loadingProducts ? (
                            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                        ) : (
                            products.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <ProductCard item={item} type="product" />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Massive Stats / Social Proof */}
            <section className="py-20 md:py-32 relative px-4 md:px-8">
                <div className="container">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { label: "Assets Sold", val: "24.8K", icon: Sparkles, color: "#10b981" },
                            { label: "Total Volume", val: "$12.4M", icon: Trophy, color: "#f59e0b" },
                            { label: "Partner Creators", val: "1,200+", icon: Rocket, color: "#3b82f6" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="glass-premium p-8 md:p-12 rounded-[32px] md:rounded-[40px] border border-white/10 text-center relative group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <stat.icon size={80} className="md:w-[120px] md:h-[120px]" />
                                </div>
                                <stat.icon className="mx-auto mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-500 w-[32px] h-[32px] md:w-[40px] md:h-[40px]" style={{ color: stat.color }} />
                                <h3 className="text-4xl md:text-6xl font-display font-black text-text-primary mb-2 tracking-tighter">{stat.val}</h3>
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-text-muted">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;