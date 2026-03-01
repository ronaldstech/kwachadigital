import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Grid,
    ChevronLeft,
    ChevronRight,
    Presentation,
    Sparkles,
    TrendingUp,
    Clock,
    Filter,
    Cpu
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import PresentationCard from '../components/PresentationCard';

const Yazam = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [presentations, setPresentations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'products'),
            where('category', '==', 'Presentations'),
            where('status', '==', 'Approved'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Normalize flags if they don't exist in DB
                trending: doc.data().viewCount > 50 || doc.data().isTrending,
                new: doc.data().createdAt?.toMillis() > Date.now() - 7 * 24 * 60 * 60 * 1000
            }));
            setPresentations(data);
            setLoading(false);
        }, (err) => {
            console.error("Firestore error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const categories = ['All', ...new Set(presentations.map(i => i.category || 'Presentations'))];

    const filteredItems = useMemo(() => {
        return presentations.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            // Since we already filter for 'Presentations' in query, this might be redundant but kept for flexibility
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [presentations, searchQuery, selectedCategory]);

    const HorizontalSection = ({ title, icon: Icon, items }) => {
        if (!items || items.length === 0) return null;
        const scrollRef = useRef(null);

        const scroll = (dir) => {
            if (!scrollRef.current) return;
            const { scrollLeft, clientWidth } = scrollRef.current;
            scrollRef.current.scrollTo({
                left: dir === 'left' ? scrollLeft - clientWidth * 0.9 : scrollLeft + clientWidth * 0.9,
                behavior: 'smooth'
            });
        };

        return (
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Icon size={18} className="text-primary" />
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">{title}</h2>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button onClick={() => scroll('left')} className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => scroll('right')} className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
                <div ref={scrollRef} className="flex gap-8 overflow-x-auto no-scrollbar pb-8 px-2 -mx-2">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            className="flex-shrink-0 w-[320px] md:w-[360px]"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6, type: "spring", bounce: 0.3 }}
                        >
                            <PresentationCard item={item} />
                        </motion.div>
                    ))}
                </div>
            </section>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
                    <Cpu className="animate-spin text-primary" size={48} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted animate-pulse">Synchronizing Portfolios...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-bg-main relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container px-4 md:px-10 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4"
                        >
                            <div className="w-8 h-[1px] bg-primary/50" />
                            <Presentation size={14} className="animate-pulse" />
                            <span>Yazam Portfolio</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-display font-black text-text-primary tracking-tighter leading-none"
                        >
                            Premium <span className="text-primary italic">Decks</span>
                        </motion.h1>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group flex-grow">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-all duration-500" size={18} />
                            <input
                                type="text"
                                placeholder="Scan for specific intelligence..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-16 pr-8 py-5 bg-surface-2/50 backdrop-blur-xl border border-white/5 rounded-3xl text-sm text-text-primary w-full md:w-[360px] focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-text-muted/30"
                            />
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar mb-16 pb-4">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-primary text-white border-primary shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] -translate-y-1'
                                : 'bg-surface-2/50 text-text-muted border-white/5 hover:border-primary/30 hover:bg-surface-2'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sections */}
                {filteredItems.length > 0 ? (
                    <>
                        <HorizontalSection
                            title="Flash intelligence"
                            icon={TrendingUp}
                            items={filteredItems.filter(i => i.trending)}
                        />
                        <HorizontalSection
                            title="Fresh Deployments"
                            icon={Sparkles}
                            items={filteredItems.filter(i => i.new)}
                        />

                        <div className="mt-28">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                        <Grid size={20} className="text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic">Central <span className="text-primary">Repository</span></h2>
                                </div>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{filteredItems.length} Assets Found</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {filteredItems.map((item, i) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                            transition={{ delay: i * 0.05, duration: 0.5, type: "spring" }}
                                            layout
                                        >
                                            <PresentationCard item={item} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 bg-surface-2/30 backdrop-blur-xl rounded-[60px] border-2 border-dashed border-white/5"
                    >
                        <div className="w-32 h-32 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                            <Presentation size={48} className="text-text-muted opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black text-text-primary mb-3 uppercase tracking-tighter">Zero Intelligence Detected</h3>
                        <p className="text-text-muted font-bold max-w-sm mx-auto uppercase tracking-widest text-[10px] opacity-60">Adjust your frequency or scanning parameters.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Yazam;
