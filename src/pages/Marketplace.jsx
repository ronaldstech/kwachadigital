import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Grid,
    Loader2,
    Sparkles,
    ShoppingBag,
    Zap,
    Eye
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { GraduationCap, Presentation, PenTool, ArrowUpRight } from 'lucide-react';

const AI_TOOLS = [
    {
        name: "Dissertation Assistant",
        description: "Advanced neural architecture optimized for complex academic research synthesis.",
        icon: GraduationCap,
        link: "/ai-tools/dissertation",
        color: "text-emerald-400",
        features: ["Research Synthesis", "Structure Analysis"]
    },
    {
        name: "PowerPoint Presentation",
        description: "High-impact visual strategy engine. Transform raw data into cinematic narratives.",
        icon: Presentation,
        link: "/ai-tools/powerpoint",
        color: "text-blue-400",
        features: ["Visual Hierarchy", "Narrative Flow"]
    },
    {
        name: "Essay Catalyst",
        description: "Unlocking linguistic depth. Intelligent drafting protocols for creative resonance.",
        icon: PenTool,
        link: "/ai-tools/essay",
        color: "text-purple-400",
        features: ["Vocal Refinement", "Linguistic Flow"]
    }
];

const SimpleToolCard = ({ tool }) => {
    const { user, openAuthModal } = useAuth();
    const navigate = useNavigate();

    const handleLaunch = (e) => {
        e.preventDefault();
        if (!user) {
            toast.info('Please login to access AI research deployments.', {
                icon: '🔒',
                style: {
                    background: '#111',
                    color: '#fff',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '16px',
                }
            });
            openAuthModal('login');
            return;
        }
        navigate(tool.link);
    };

    return (
        <div className="h-full bg-surface-1/40 rounded-[32px] border border-white/5 p-6 flex flex-col transition-all duration-300 hover:border-primary/30">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-3">
                <tool.icon size={32} className={tool.color} />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">{tool.name}</h3>
            <p className="text-sm text-text-secondary opacity-60 mb-6 flex-1 italic">{tool.description}</p>
            <button
                onClick={handleLaunch}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300"
            >
                Launch <ArrowUpRight size={14} />
            </button>
        </div>
    );
};

const Marketplace = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(
        searchParams.get('type') === 'services' ? 'services' : 'products'
    );
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(1000000);
    const [products, setProducts] = useState({ products: [], services: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const type = searchParams.get('type');
        setActiveTab(type === 'services' ? 'services' : 'products');
    }, [searchParams]);

    const handleTabChange = (type) => {
        setSearchParams({ type });
        setSelectedCategory('All');
    };

    useEffect(() => {
        const q = query(
            collection(db, 'products'),
            where('status', '==', 'Approved')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    name: data.title || data.name || 'Untitled',
                    image: data.imageUrl || data.image || null,
                    price: Number(data.price) || 0,
                    originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
                    viewCount: Number(data.viewCount) || 0,
                    rating: Number(data.rating) || 0,
                    reviews: Number(data.reviews) || 0,
                    category: data.category || 'General',
                    type: data.type || 'product'
                };
            });

            setProducts({
                products: fetchedItems.filter(i => i.type === 'product'),
                services: fetchedItems.filter(i => i.type === 'service')
            });

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const items = activeTab === 'products'
        ? products.products
        : products.services;

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                String(item.name || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === 'All' || item.category === selectedCategory;

            const numericPrice = Number(item.price) || 0;
            const matchesPrice = numericPrice <= priceRange;

            return matchesSearch && matchesCategory && matchesPrice;
        });
    }, [items, searchQuery, selectedCategory, priceRange]);

    // Sorting Helper
    const getTime = (date) => {
        if (!date) return 0;
        if (date.toMillis) return date.toMillis();
        if (date.seconds) return date.seconds * 1000;
        return new Date(date).getTime() || 0;
    };

    // Specific Sections
    const newArrivals = useMemo(() => {
        return [...filteredItems].sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
    }, [filteredItems]);

    const mostViewed = useMemo(() => {
        return [...filteredItems].sort((a, b) => (Number(b.viewCount) || 0) - (Number(a.viewCount) || 0));
    }, [filteredItems]);

    const onPromotion = useMemo(() => {
        return filteredItems.filter(i => (Number(i.originalPrice) || 0) > (Number(i.price) || 0));
    }, [filteredItems]);

    const bestSelling = useMemo(() => {
        // For now, using viewCount as a proxy for popularity
        return [...mostViewed].reverse().slice(0, 10);
    }, [mostViewed]);

    /* =========================
   Horizontal Scroll Section
========================== */
    const HorizontalSection = ({ title, icon: Icon, items }) => {
        if (!items || items.length === 0) return null;

        const scrollRef = useRef(null);

        const scroll = (dir) => {
            if (!scrollRef.current) return;
            const { scrollLeft, clientWidth } = scrollRef.current;

            scrollRef.current.scrollTo({
                left:
                    dir === 'left'
                        ? scrollLeft - clientWidth * 0.9
                        : scrollLeft + clientWidth * 0.9,
                behavior: 'smooth'
            });
        };

        return (
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Icon size={18} className="text-primary" />
                        <h2 className="text-2xl font-semibold text-text-primary">
                            {title}
                        </h2>
                    </div>

                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto no-scrollbar pb-4"
                >
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            className="
                            flex-shrink-0
                            w-[270px]
                            md:w-[290px]
                            lg:w-[310px]
                            h-[420px]
                        "
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                        >
                            <div className="h-full">
                                <ProductCard item={item} type={item.type || 'product'} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        );
    };

    /* =========================
       RENDER
    ========================== */
    return (
        <div className="min-h-screen pt-32 pb-24 bg-bg-main">
            <div className="container px-4 md:px-10">

                {/* Header */}
                <div className="flex justify-between items-center mb-14">
                    <h1 className="text-4xl font-bold text-text-primary">
                        Marketplace
                    </h1>
                </div>

                {/* Loading */}
                <AnimatePresence>
                    {loading && (
                        <div className="flex justify-center py-32">
                            <Loader2 className="animate-spin text-primary w-10 h-10" />
                        </div>
                    )}
                </AnimatePresence>

                {!loading && filteredItems.length > 0 && (
                    <>
                        <HorizontalSection
                            title="New Arrivals"
                            icon={Sparkles}
                            items={newArrivals}
                        />
                        {/* AI Tools Section */}
                        <section className="mt-32 mb-20">
                            <div className="flex items-center gap-3 mb-5">
                                <Sparkles size={24} className="text-primary" />
                                <h2 className="text-2xl font-bold text-text-primary">
                                    AI Research Deployments
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {AI_TOOLS.map(tool => (
                                    <div key={tool.name} className="h-[350px]">
                                        <SimpleToolCard tool={tool} />
                                    </div>
                                ))}
                            </div>
                        </section>
                        <HorizontalSection
                            title="Best Selling"
                            icon={ShoppingBag}
                            items={bestSelling}
                        />

                        <HorizontalSection
                            title="On Promotion"
                            icon={Zap}
                            items={onPromotion}
                        />

                        <HorizontalSection
                            title="Most Viewed"
                            icon={Eye}
                            items={mostViewed}
                        />


                    </>
                )}

                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-32">
                        <h3 className="text-xl font-semibold text-text-primary mb-3">
                            No items found
                        </h3>
                        <p className="text-text-secondary">
                            Try adjusting your filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;