import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowUpRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ item, type }) => {
    const { addToCart, toggleFavorite, isInCart, isInFavorites } = useStore();
    const { user } = useAuth();

    const isOnSale = item.originalPrice > item.price;

    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
            className="group relative bg-bg-main/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                <img
                    src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-md bg-primary/20 text-primary backdrop-blur-sm">
                        {item.category}
                    </span>

                    {isOnSale && (
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-md bg-secondary/20 text-secondary backdrop-blur-sm">
                            Sale
                        </span>
                    )}
                </div>

                {/* Favorite */}
                <button
                    onClick={(e) => { e.preventDefault(); toggleFavorite(item); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border transition-all ${isInFavorites(item.id)
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-black/30 border-white/10 text-white hover:bg-white/10'
                        }`}
                >
                    <Heart size={14} className={isInFavorites(item.id) ? 'fill-primary' : ''} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col">
                {/* Rating + Type */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-text-secondary">
                        <Star size={14} className="text-secondary fill-secondary" />
                        {item.rating || '4.9'}
                        <span className="opacity-50">({item.reviews || '24'})</span>
                    </div>

                    <span className="text-[9px] uppercase tracking-widest font-mono text-primary/70">
                        {type === 'product' ? 'Product' : 'Service'}
                    </span>
                </div>

                {/* Title */}
                <Link to={`/product/${item.id}`}>
                    <h3 className="text-base font-semibold text-text-primary line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {item.title || item.name}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-xs text-text-secondary line-clamp-2 mb-4 opacity-70">
                    {item.description || "Premium digital asset engineered for scale and performance."}
                </p>

                {/* Price + Cart */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <div>
                        {isOnSale && (
                            <span className="text-[10px] text-secondary/60 line-through block">
                                MWK {item.originalPrice?.toLocaleString()}
                            </span>
                        )}
                        <span className="text-lg font-bold text-primary">
                            MWK {(item.price || 0).toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={(e) => { e.preventDefault(); addToCart(item); }}
                        className={`p-2.5 rounded-lg border transition-all ${isInCart(item.id)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/40'
                            }`}
                    >
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;