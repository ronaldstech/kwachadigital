import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Grid, List as ListIcon, Sparkles, Zap, ArrowUpDown, ChevronDown, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Marketplace = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(searchParams.get('type') === 'services' ? 'services' : 'products');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(1000000); // 1M as max default
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    // Sync tab state with URL parameters
    useEffect(() => {
        const type = searchParams.get('type');
        setActiveTab(type === 'services' ? 'services' : 'products');
    }, [searchParams]);

    const handleTabChange = (type) => {
        setSearchParams({ type });
        setSelectedCategory('All');
    };

    const min = 0;
    const max = 1000000;
    const percentage = ((priceRange - min) / (max - min)) * 100;

    const [products, setProducts] = useState({ products: [], services: [] });
    const [loading, setLoading] = useState(true);

    // Fetch live products
    useEffect(() => {
        const q = query(
            collection(db, 'products'),
            where('status', '==', 'Approved')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Map Firestore schema to ProductCard schema
                name: doc.data().title,
                image: doc.data().imageUrl || null,
                category: doc.data().category || 'General',
                price: doc.data().price || 0,
                rating: '4.9', // Default mock for now
                reviews: '24'  // Default mock for now
            }));

            // Optional: If you eventually have types (products vs services) in DB, you can split them here.
            // For now, we put everything in 'products' and leave 'services' empty or duplicate if needed based on category.
            // Assuming for now everything fetched is a product unless categorized as service.
            setProducts({
                products: fetchedItems,
                services: [] // Add service filtering logic here if needed
            });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching marketplace items:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const categories = useMemo(() => {
        const items = activeTab === 'products' ? products.products : products.services;
        const uniqueCats = ['All', ...new Set(items.map(item => item.category))];
        return uniqueCats;
    }, [activeTab, products]);

    const filteredItems = useMemo(() => {
        const items = activeTab === 'products' ? products.products : products.services;
        return items.filter(item => {
            const matchesSearch = String(item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

            const numericPrice = typeof item.price === 'string'
                ? parseFloat(item.price.replace(/,/g, ''))
                : Number(item.price) || 0;

            const matchesPrice = numericPrice <= priceRange;
            return matchesSearch && matchesCategory && matchesPrice;
        });
    }, [activeTab, searchQuery, selectedCategory, priceRange, products]);

    return (
        <div className="relative min-h-screen pt-32 lg:pt-40 pb-32 overflow-hidden bg-bg-main">
            {/* Immersive Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-12">
                {/* Elite Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 lg:mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <div className="w-10 h-px bg-primary" />
                            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Elite Digital Arcade</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-7xl font-display font-black text-text-primary tracking-tighter leading-[0.9] mb-4 md:mb-6"
                        >
                            Discover <span className="text-gradient">Premium</span> Assets<span className="text-primary">.</span>
                        </motion.h1>
                        <p className="text-base md:text-lg text-text-secondary font-medium opacity-80">
                            The ultimate destination for African creators to trade and scale.
                        </p>
                    </div>

                    {/* Elite Tab Controller */}
                    <div className="flex glass p-1 rounded-2xl border-glass-border shadow-2xl relative w-full md:w-auto overflow-hidden">
                        <div
                            className="absolute inset-y-1 transition-all duration-500 bg-primary rounded-xl shadow-lg shadow-primary/20"
                            style={{
                                left: activeTab === 'products' ? '4px' : 'calc(50% + 1px)',
                                width: 'calc(50% - 5px)'
                            }}
                        />
                        <button
                            onClick={() => handleTabChange('products')}
                            className={`relative z-10 flex-1 md:flex-none px-6 md:px-8 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors duration-500 ${activeTab === 'products' ? 'text-white' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => handleTabChange('services')}
                            className={`relative z-10 flex-1 md:flex-none px-6 md:px-8 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors duration-500 ${activeTab === 'services' ? 'text-white' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Yazam
                        </button>
                    </div>
                </div>

                {/* Mobile Search & Price Slider (Sticky-ish) */}
                <div className="lg:hidden space-y-4 mb-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search marketplace..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-bg-main/40 glass py-3 pl-11 pr-4 rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 transition-all border-white/5"
                        />
                    </div>

                    {/* Compact Price Slider for Mobile */}
                    <div className="glass-premium p-5 rounded-2xl border-white/5 space-y-4">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-text-muted">Price Range</h4>
                            <span className="text-[10px] font-black text-primary px-2 py-1 bg-primary/10 rounded-lg">MK {priceRange === 1000000 ? 'Any' : priceRange.toLocaleString()}</span>
                        </div>
                        <div className="relative pt-2">
                            <input
                                type="range"
                                min={min}
                                max={max}
                                step="5000"
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                style={{
                                    background: `linear-gradient(to right, #33701dff ${percentage}%, #e5e7eb ${percentage}%)`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Horizontal Category Scroll */}
                <div className="lg:hidden mb-10 overflow-x-auto no-scrollbar flex gap-3 pb-2 -mx-4 px-4 scroll-smooth">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedCategory === cat ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-bg-main/40 glass text-text-secondary border-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-80 shrink-0">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-40 space-y-8"
                        >
                            {/* Search Box */}
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input
                                    type="text"
                                    placeholder="Find something elite..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-bg-main/40 glass py-4 pl-12 pr-4 rounded-2xl text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all border-white/5"
                                />
                            </div>

                            <div className="glass-premium p-8 rounded-[32px] border-white/5 space-y-10 shadow-2xl">
                                <div className="flex items-center gap-3 text-text-primary font-black uppercase tracking-widest text-[12px] border-b border-white/5 pb-4">
                                    <SlidersHorizontal size={16} className="text-primary" />
                                    <span>Advanced Filters</span>
                                </div>

                                {/* Category Section */}
                                <div>
                                    <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted mb-6">Discovery Category</h4>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`group flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-500 relative overflow-hidden ${selectedCategory === cat ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}
                                            >
                                                <span className="relative z-10">{cat}</span>
                                                <ChevronDown size={14} className={`relative z-10 opacity-40 group-hover:rotate-[-90deg] transition-transform ${cat === 'All' ? 'hidden' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted">Price Range</h4>
                                        <span className="text-[10px] font-black text-primary px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shadow-lg shadow-primary/5">MK {priceRange === 1000000 ? 'Any' : priceRange.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="relative pt-2">
                                            <input
                                                type="range"
                                                min={min}
                                                max={max}
                                                step="5000"
                                                value={priceRange}
                                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                style={{
                                                    background: `linear-gradient(to right, #33701dff ${percentage}%, #e5e7eb ${percentage}%)`
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest pt-2">
                                            <span className="opacity-40">0 MWK</span>
                                            <span className="opacity-40">1,000,000 MWK</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setPriceRange(1000000); }}
                                    className="w-full py-4 rounded-xl border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all duration-500"
                                >
                                    Reset Selection
                                </button>
                            </div>

                            {/* Promotional Spot - Hidden on Mobile */}
                            <div className="hidden lg:block relative glass-premium p-6 rounded-[32px] overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
                                <div className="relative z-10 space-y-4">
                                    <Sparkles size={20} className="text-primary" />
                                    <h5 className="text-sm font-black text-text-primary">Need a custom plan?</h5>
                                    <p className="text-[11px] text-text-secondary font-medium">Join our VIP membership for unlimited premium assets and support.</p>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group/btn">
                                        Inner Circle Access <Zap size={12} className="group-hover/btn:translate-y-[-2px] transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </aside>

                    {/* Elite Grid Section */}
                    <main className="flex-grow">
                        {/* Grid Header Controls */}
                        <div className="hidden md:flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4 text-text-muted">
                                <Grid className="text-primary" size={20} />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{filteredItems.length} Elite Items Found</span>
                            </div>
                            <div className="flex items-center gap-2 glass p-1 rounded-xl border-white/5">
                                <button className="p-2 text-primary bg-white/5 rounded-lg"><Grid size={16} /></button>
                                <button className="p-2 text-text-muted hover:text-white transition-colors"><ListIcon size={16} /></button>
                            </div>
                        </div>

                        {/* Staggered Grid */}
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center min-h-[400px]"
                                >
                                    <Loader2 className="animate-spin text-primary w-12 h-12" />
                                </motion.div>
                            ) : filteredItems.length > 0 ? (
                                <motion.div
                                    key={activeTab + selectedCategory + priceRange}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                                >
                                    {filteredItems.map((item) => (
                                        <ProductCard
                                            key={item.id}
                                            item={item}
                                            type={activeTab === 'products' ? 'product' : 'service'}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-premium p-12 lg:p-24 rounded-[40px] text-center border-white/5"
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-primary/5 mb-8">
                                        <Search size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-display font-black text-text-primary mb-4">No assets found</h3>
                                    <p className="text-text-secondary font-medium max-w-sm mx-auto mb-10 opacity-70">
                                        Try adjusting your filters to find the perfect asset.
                                    </p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setPriceRange(1000000); }}
                                        className="bg-primary text-white font-black uppercase tracking-widest text-[10px] px-10 py-4 rounded-xl shadow-lg shadow-primary/20"
                                    >
                                        Clear Filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
