import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, Rocket, CheckCircle, Star, CreditCard, Target, Inbox } from 'lucide-react';
const LucideIcons = { CreditCard, Target, Inbox, Zap, Star, Shield, Globe, Rocket, CheckCircle };
import ProductCard from '../components/ProductCard';
import { PRESENTATIONS, SERVICES, TICKER_ITEMS } from '../constants';

const FloatingAsset = ({ icon: Icon, color, delay = 0, x = 0, y = 0, scale = 1 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5, rotateY: 45 }}
        animate={{
            opacity: 1,
            scale: scale,
            rotateY: 0,
            y: [y, y - 20, y],
            rotate: [0, 5, 0]
        }}
        transition={{
            duration: 0.8,
            delay: delay,
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ left: x, top: y }}
        className="absolute"
    >
        <div className={`p-5 glass-premium rounded-[24px] border border-white/20 shadow-2xl backdrop-blur-3xl`} style={{ backgroundColor: `${color}10` }}>
            <Icon size={32} style={{ color: color }} />
            <div className="absolute -inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-[24px] pointer-events-none" />
        </div>
    </motion.div>
);

const TickerItem = ({ item, isReverse = false }) => {
    const Icon = LucideIcons[item.icon] || LucideIcons.Zap;
    return (
        <div className={`flex items-center gap-4 glass-premium px-6 py-3 rounded-[20px] border-glass-border shadow-xl hover:scale-105 transition-transform duration-300 ${isReverse ? 'opacity-80 hover:opacity-100' : ''}`}>
            <div className={`p-2.5 rounded-xl bg-bg-main shadow-inner inline-flex items-center justify-center`} style={{ color: item.color }}>
                <Icon size={18} />
            </div>
            <div className="flex flex-col">
                <span className="text-[13px] font-bold text-text-primary leading-none mb-1">{item.name}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.time}</span>
            </div>
        </div>
    );
};

const Home = () => {
    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[95vh] flex items-center pt-32 pb-24 lg:pt-48 lg:pb-32">
                {/* Immersive Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-15%] right-[-5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[140px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px]" />
                    <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px] animation-delay-3000" />
                </div>

                <div className="container relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                            className="flex-1 text-center lg:text-left"
                        >
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 glass-premium rounded-full text-[12px] font-bold text-primary uppercase tracking-[0.25em] mb-10 border border-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <Star size={16} className="fill-primary" />
                                </motion.div>
                                The New Standard for Digital Assets
                            </motion.span>

                            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-[900] text-text-primary mb-8 leading-[1.05] tracking-tight">
                                Unleash Your <br />
                                <span className="text-gradient drop-shadow-[0_10px_30px_rgba(16,185,129,0.4)]">Digital Empire</span>
                            </h1>

                            <p className="text-lg md:text-xl text-text-secondary mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                                Join the elite curated marketplace for world-class digital products and high-performance talent. Built for the modern creator economy.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                                <Link to="/marketplace" className="btn btn-primary px-10 py-5 text-lg rounded-2xl group shadow-[0_20px_40px_-5px_rgba(16,185,129,0.4)] overflow-hidden relative">
                                    <span className="relative z-10 flex items-center gap-2 font-bold">
                                        Explore Assets
                                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                                <Link to="/sell" className="btn btn-outline px-10 py-5 text-lg rounded-2xl group border-glass-border hover:bg-white/5 font-bold">
                                    Start Selling
                                </Link>
                            </div>

                            {/* Trusted by 500+ Local Creators */}
                            <div className="mt-16 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-main bg-surface-2 glass overflow-hidden flex items-center justify-center font-bold text-[10px] text-primary">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-bg-main bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                        +5K
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                                    Trusted by <span className="text-text-primary">5,000+</span> creators in Malawi
                                </p>
                            </div>
                        </motion.div>

                        {/* Animated Hero Graphic */}
                        <div className="flex-1 relative w-full h-[400px] lg:h-[600px] hidden sm:block">
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Orbiting Rings */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[450px] h-[450px] border border-primary/20 rounded-full border-dashed opacity-30"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[300px] h-[300px] border border-accent/20 rounded-full border-dashed opacity-20"
                                />

                                {/* Center Piece */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative z-20 glass-premium p-10 rounded-[40px] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
                                >
                                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-inner">
                                        <Rocket size={64} className="text-white animate-float" />
                                    </div>
                                    <div className="absolute -top-4 -right-4 bg-accent p-3 rounded-2xl shadow-xl border border-white/20">
                                        <Zap size={24} className="text-white" />
                                    </div>
                                </motion.div>

                                {/* Floating Elements */}
                                <FloatingAsset icon={Shield} color="#10b981" x="15%" y="20%" delay={0.2} scale={1.1} />
                                <FloatingAsset icon={Globe} color="#3b82f6" x="75%" y="15%" delay={0.4} scale={0.9} />
                                <FloatingAsset icon={Zap} color="#f59e0b" x="10%" y="70%" delay={0.6} scale={0.8} />
                                <FloatingAsset icon={Star} color="#ec4899" x="80%" y="75%" delay={0.8} scale={1} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scrolling Tickers - Dual Row Reverse */}
            <div className="relative z-20 py-6 overflow-hidden flex flex-col gap-6 bg-bg-main/40 backdrop-blur-3xl border-y border-glass-border">
                {/* Row 1: Left to Right */}
                <div className="flex animate-scroll-ticker gap-6 px-4 items-center whitespace-nowrap">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
                        <TickerItem key={`l-${idx}`} item={item} />
                    ))}
                </div>
                {/* Row 2: Right to Left */}
                <div className="flex animate-scroll-ticker-reverse gap-6 px-4 items-center whitespace-nowrap">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].reverse().map((item, idx) => (
                        <TickerItem key={`r-${idx}`} item={item} isReverse={true} />
                    ))}
                </div>

                {/* Decorative gradients for the ticker edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-main to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-main to-transparent z-10 pointer-events-none" />
            </div>

            {/* Featured Grid Section */}
            <section className="py-12 container relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary/50 to-transparent" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pt-12">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 mb-5"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                                <Zap size={20} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Handpicked Quality</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary tracking-tight">Digital Masterpieces</h2>
                        <p className="text-text-secondary text-lg md:text-xl mt-6 font-medium">Curated assets from Malawi's most talented digital artisans.</p>
                    </div>
                    <Link to="/marketplace?type=products" className="group flex items-center gap-3 text-sm font-bold text-text-primary py-3 px-8 rounded-full h-fit glass border border-glass-border hover:bg-primary/10 hover:border-primary/30 transition-all">
                        View Entire Catalog
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRESENTATIONS.slice(0, 4).map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <ProductCard item={item} type="product" />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Dynamic Glass Stats Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Background Depth Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[200px] animate-pulse pointer-events-none" />

                <div className="container relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            { title: '15K+', desc: 'Asset Deliveries', icon: <Globe size={32} />, color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
                            { title: 'MK 750M+', desc: 'Creator Payouts', icon: <Star size={32} />, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
                            { title: '99.9%', desc: 'Trust Score', icon: <Shield size={32} />, color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                whileHover={{ y: -10 }}
                                className="group relative glass-premium p-12 rounded-[50px] border border-white/10 hover:border-white/30 transition-all duration-700 overflow-hidden text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]"
                            >
                                {/* Interactive Spotlight Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="absolute -inset-px bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="mb-8 relative inline-block">
                                    <motion.div
                                        className="p-6 glass rounded-[30px] border-glass-border inline-flex items-center justify-center transform transition-all duration-700 shadow-2xl relative z-10"
                                        whileHover={{ rotate: 12, scale: 1.1 }}
                                        style={{ color: stat.color, backgroundColor: `${stat.color}10` }}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                    {/* Icon Glow */}
                                    <div className="absolute inset-0 blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-700" style={{ backgroundColor: stat.glow }} />
                                </div>

                                <motion.h3
                                    className="text-5xl lg:text-6xl font-display font-[900] text-text-primary mb-4 tracking-tighter"
                                    style={{ textShadow: `0 10px 40px ${stat.glow}` }}
                                >
                                    {stat.title}
                                </motion.h3>
                                <p className="text-text-muted font-bold uppercase tracking-[0.25em] text-[11px] opacity-70 group-hover:opacity-100 transition-opacity">
                                    {stat.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid Section - Diagonal Cut */}
            <section className="py-5 container relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 mb-5"
                        >
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-lg border border-secondary/20">
                                <Rocket size={20} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Elite Talent</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary tracking-tight">On-Demand Expertise</h2>
                        <p className="text-text-secondary text-lg md:text-xl mt-6 font-medium">Connect with top-tier Malawian professionals for your next big project.</p>
                    </div>
                    <Link to="/marketplace?type=services" className="group flex items-center gap-3 text-sm font-bold text-text-primary py-3 px-8 rounded-full h-fit glass border border-glass-border hover:bg-secondary/10 hover:border-secondary/30 transition-all">
                        Browse Full Directory
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {SERVICES.slice(0, 4).map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <ProductCard item={item} type="service" />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Premium Immersive CTA */}
            <section className="py-10 container">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-12 md:p-24 rounded-[60px] overflow-hidden text-center glass-premium border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent -z-10 animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10">
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-bg-main glass border border-white/20 flex items-center justify-center mx-auto mb-12 shadow-2xl overflow-hidden"
                        >
                            <Rocket size={64} className="text-primary" />
                        </motion.div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-[900] text-text-primary mb-8 leading-[0.95] tracking-tighter">
                            Your <span className="text-gradient">Legacy</span> <br className="hidden md:block" />
                            Starts Today.
                        </h2>

                        <p className="text-xl md:text-2xl text-text-secondary mb-16 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
                            Join the fastest-growing digital ecosystem in Malawi. <br className="hidden md:block" />
                            The future is here, and it's built by you.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link to="/signup" className="btn btn-primary px-14 py-6 text-xl rounded-[24px] shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] font-[900] tracking-tight group">
                                Open Your Digital Shop
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ArrowRight size={24} />
                                </motion.span>
                            </Link>
                            <Link to="/marketplace" className="btn btn-outline px-14 py-6 text-xl rounded-[24px] font-bold border-glass-border hover:bg-white/5">
                                Exploration Mode
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
