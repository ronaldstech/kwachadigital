import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from './ProductCard';

const ProductCarousel = () => {
    const [hotProducts, setHotProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchHotProducts = async () => {
            try {
                // Fetch top 6 products by viewCount or salesCount
                const q = query(
                    collection(db, 'products'),
                    where('status', '==', 'Approved'),
                    orderBy('viewCount', 'desc'),
                    limit(6)
                );
                const snap = await getDocs(q);
                const items = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Map schema
                    name: doc.data().title,
                    image: doc.data().imageUrl || null,
                    category: doc.data().category || 'General',
                    price: doc.data().price || 0,
                }));
                setHotProducts(items);
            } catch (err) {
                console.error("Error fetching carousel products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotProducts();
    }, []);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % hotProducts.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + hotProducts.length) % hotProducts.length);
    };

    if (loading) return (
        <div className="py-20 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (hotProducts.length === 0) return null;

    return (
        <div className="relative group">
            <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Featured Highlight Card */}
                <div className="w-full lg:w-1/2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hotProducts[currentIndex].id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.5 }}
                            className="relative aspect-[4/3] rounded-[48px] overflow-hidden glass shadow-2xl bg-surface-2"
                        >
                            <img
                                src={hotProducts[currentIndex].image}
                                alt={hotProducts[currentIndex].name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute bottom-10 left-10 right-10">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3 mb-4"
                                >
                                    <span className="px-4 py-1.5 bg-primary/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30">
                                        Trending Now
                                    </span>
                                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                                        {hotProducts[currentIndex].category}
                                    </span>
                                </motion.div>
                                <motion.h3
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl md:text-4xl font-display font-black text-white mb-4"
                                >
                                    {hotProducts[currentIndex].name}
                                </motion.h3>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center justify-between"
                                >
                                    <div className="text-2xl font-black text-primary">
                                        MK {Number(hotProducts[currentIndex].price).toLocaleString()}
                                    </div>
                                    <Link
                                        to={`/product/${hotProducts[currentIndex].id}`}
                                        className="btn btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 group/btn"
                                    >
                                        View Asset <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation & Feed */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-2xl font-display font-black text-text-primary mb-1">Elite Selection</h4>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest italic flex items-center gap-2">
                                <Zap size={14} className="text-secondary" /> Curated based on performance
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={prev}
                                className="w-12 h-12 rounded-2xl glass border border-glass-border flex items-center justify-center text-text-primary hover:bg-primary hover:text-white transition-all duration-500"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={next}
                                className="w-12 h-12 rounded-2xl glass border border-glass-border flex items-center justify-center text-text-primary hover:bg-primary hover:text-white transition-all duration-500"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {hotProducts.map((product, idx) => (
                            <motion.button
                                key={product.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative aspect-video rounded-3xl overflow-hidden glass border-2 transition-all duration-500 ${currentIndex === idx ? 'border-primary shadow-xl shadow-primary/20 scale-[1.02]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={product.image} className="w-full h-full object-cover" alt="" />
                                <div className={`absolute inset-0 bg-primary/20 transition-opacity duration-500 ${currentIndex === idx ? 'opacity-100' : 'opacity-0'}`} />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCarousel;
