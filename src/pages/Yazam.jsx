import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Grid,
    ChevronLeft,
    ChevronRight,
    Presentation,
    Sparkles,
    TrendingUp,
    Clock,
    Filter
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRESENTATIONS } from '../constants';

const Yazam = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Use mock data from constants
    const items = PRESENTATIONS.map(p => ({
        ...p,
        title: p.name,
        price: Number(p.price.replace(/,/g, '')),
        imageUrl: null, // Using placeholder icons for now as per constants
        type: 'product', // Presentations are treated as products
        reviews: 0,
        rating: 0
    }));

    const categories = ['All', ...new Set(items.map(i => i.category))];

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, searchQuery, selectedCategory]);

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
                        <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button onClick={() => scroll('left')} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => scroll('right')} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
                <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            className="flex-shrink-0 w-[270px] md:w-[290px] lg:w-[310px] h-[420px]"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                        >
                            <ProductCard item={item} type="product" />
                        </motion.div>
                    ))}
                </div>
            </section>
        );
    };

    return (
        <div className="min-h-screen pt-32 pb-24 bg-bg-main relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="container px-4 md:px-10 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-3"
                        >
                            <Presentation size={14} />
                            <span>Yazam Portfolio</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-display font-black text-text-primary tracking-tighter"
                        >
                            Premium <span className="text-primary">Presentations</span>
                        </motion.h1>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search decks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-surface-2 border border-white/10 rounded-2xl text-sm text-text-primary w-full sm:w-[300px] focus:outline-none focus:border-primary/50 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${selectedCategory === cat
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-surface-2 text-text-secondary border-white/5 hover:border-primary/30'
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
                            title="Trending Decks"
                            icon={TrendingUp}
                            items={filteredItems.filter(i => i.trending)}
                        />
                        <HorizontalSection
                            title="Latest Uploads"
                            icon={Sparkles}
                            items={filteredItems.filter(i => i.new)}
                        />

                        <div className="mt-20">
                            <div className="flex items-center gap-3 mb-8">
                                <Grid size={18} className="text-primary" />
                                <h2 className="text-2xl font-semibold text-text-primary">All Presentations</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredItems.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <ProductCard item={item} type="product" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-32 glass rounded-[40px] border-dashed border-white/10">
                        <Presentation size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
                        <h3 className="text-xl font-semibold text-text-primary mb-2">No presentations found</h3>
                        <p className="text-text-secondary">Try adjusting your search or category filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Yazam;
