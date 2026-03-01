import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, Zap, Sparkles, ArrowRight, Eye, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const SmartHeroSlideshow = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlidesData = async () => {
            try {
                const q = query(
                    collection(db, 'products'),
                    where('status', '==', 'Approved'),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
                const snap = await getDocs(q);
                const items = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    name: doc.data().title || doc.data().name || 'Untitled',
                    image: doc.data().imageUrl || doc.data().image || null,
                    price: Number(doc.data().price) || 0,
                    originalPrice: Number(doc.data().originalPrice) || 0,
                    viewCount: Number(doc.data().viewCount) || 0,
                    rating: Number(doc.data().rating) || 0,
                    reviews: Number(doc.data().reviews) || 0,
                }));

                if (items.length === 0) {
                    setLoading(false);
                    return;
                }

                const processedSlides = [];

                // 1. New Arrival (Latest item)
                processedSlides.push({
                    ...items[0],
                    label: 'New Arrival',
                    icon: Sparkles,
                    color: '#10b981'
                });

                // 2. High View (Top viewed)
                const mostViewed = [...items].sort((a, b) => b.viewCount - a.viewCount)[0];
                processedSlides.push({
                    ...mostViewed,
                    label: 'Most Viewed',
                    icon: Eye,
                    color: '#3b82f6'
                });

                // 3. On Promotion (originalPrice > price)
                const onPromo = items.find(i => i.originalPrice > i.price) || items[items.length - 1];
                processedSlides.push({
                    ...onPromo,
                    label: 'On Promotion',
                    icon: Zap,
                    color: '#f59e0b'
                });

                // 4. Best Selling (Popular as proxy)
                const bestSelling = items.length > 2 ? items[2] : items[0];
                processedSlides.push({
                    ...bestSelling,
                    label: 'Best Selling',
                    icon: ShoppingBag,
                    color: '#ec4899'
                });

                setSlides(processedSlides);
            } catch (err) {
                console.error("Error fetching hero slides:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSlidesData();
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides]);

    if (loading || slides.length === 0) {
        return (
            <div className="flex-1 relative w-full h-[400px] lg:h-[600px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const currentSlide = slides[currentIndex];
    const Icon = currentSlide.icon;

    return (
        <div className="flex-1 relative w-full h-[400px] lg:h-[600px]">
            <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide.id + currentSlide.label}
                        initial={{ opacity: 0, scale: 0.8, rotateY: 45, x: 100, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.2, rotateY: -45, x: -100, filter: 'blur(10px)' }}
                        transition={{
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                            opacity: { duration: 0.4 }
                        }}
                        className="relative z-20 glass-premium p-4 md:p-6 rounded-[32px] md:rounded-[40px] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl w-[90%] max-w-[320px] md:max-w-[400px]"
                    >
                        {/* Image Container */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6 group"
                        >
                            <img
                                src={currentSlide.image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"}
                                alt={currentSlide.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Label Badge */}
                            <div className="absolute top-4 left-4">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg"
                                    style={{ backgroundColor: `${currentSlide.color}30` }}
                                >
                                    <Icon size={16} style={{ color: currentSlide.color }} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                        {currentSlide.label}
                                    </span>
                                </motion.div>
                            </div>

                            {/* Price Badge */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                className="absolute bottom-4 right-4 bg-primary/90 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl backdrop-blur-sm"
                            >
                                MK {currentSlide.price.toLocaleString()}
                            </motion.div>
                        </motion.div>

                        {/* Title & Info */}
                        <div className="px-2">
                            <motion.h3
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl md:text-2xl font-display font-black text-text-primary line-clamp-1 mb-2"
                            >
                                {currentSlide.name}
                            </motion.h3>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center justify-between mt-4"
                            >
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-main bg-surface-2 overflow-hidden flex items-center justify-center text-[10px] font-bold text-primary">
                                            {String.fromCharCode(64 + (currentIndex + i) % 26)}
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-bg-main bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                                        +5K
                                    </div>
                                </div>
                                <Link
                                    to={`/product/${currentSlide.id}`}
                                    className="flex items-center gap-2 text-primary font-bold text-sm group/link hover:opacity-80 transition-opacity"
                                >
                                    View Details
                                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Animated Background Rings (Enhanced version of the original) */}
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[500px] h-[500px] border-2 border-primary/10 rounded-full border-dashed opacity-20 pointer-events-none"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[350px] h-[350px] border-2 border-accent/10 rounded-full border-dashed opacity-10 pointer-events-none"
                />

                {/* Floating Micro-elements */}
                <motion.div
                    animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-20 w-8 h-8 bg-primary/20 rounded-full blur-xl"
                />
                <motion.div
                    animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 left-20 w-12 h-12 bg-accent/20 rounded-full blur-xl"
                />
            </div>
        </div >
    );
};

export default SmartHeroSlideshow;
