import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Favorites = () => {
    const { favorites, loading } = useStore();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-main flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
        );
    }

    // Map favorites back to the structure expected by ProductCard
    // Note: StoreContext saves { productId, title, price, imageUrl, category }
    const favoriteProducts = favorites.map(fav => ({
        id: fav.productId,
        name: fav.title,
        price: fav.price,
        image: fav.imageUrl,
        category: fav.category,
    }));

    return (
        <div className="relative min-h-screen pt-32 lg:pt-40 pb-32 overflow-hidden bg-bg-main">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate('/marketplace')}
                            className="group flex items-center gap-2 text-text-muted hover:text-primary transition-all mb-6"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Marketplace</span>
                        </motion.button>
                        <h1 className="text-4xl md:text-6xl font-display font-black text-text-primary tracking-tighter">
                            Your <span className="text-secondary">Favorites</span>
                        </h1>
                    </div>
                    <div className="glass px-6 py-3 rounded-2xl border-white/5 flex items-center gap-3">
                        <Heart size={20} className="text-secondary fill-secondary" />
                        <span className="text-sm font-black text-text-primary uppercase tracking-widest">{favorites.length} Saved</span>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium p-16 md:p-24 rounded-[40px] text-center border-white/5 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary mb-8">
                            <Heart size={40} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-black text-text-primary mb-4">No favorites yet</h2>
                        <p className="text-text-muted max-w-md mb-10 font-medium">Save digital assets that catch your eye to view them later. Build your collection of premium African digital tools.</p>
                        <Link to="/marketplace" className="btn glass px-10 py-5 rounded-2xl flex items-center gap-3 border-white/10 hover:bg-white/5 transition-all group">
                            <Sparkles size={18} className="text-secondary" />
                            Discover Assets
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {favoriteProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <ProductCard item={product} type="product" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
