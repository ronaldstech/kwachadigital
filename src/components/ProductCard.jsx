import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Star, ShoppingCart, ArrowUpRight, ShieldCheck, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ProductCard = ({ item, type }) => {
    const { addToCart, toggleFavorite, isInCart, isInFavorites } = useStore();
    const { user } = useAuth();

    // Mouse tracking for spotlight effect
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);



    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -12 }}
            onMouseMove={handleMouseMove}
            className="group relative h-full rounded-[32px] p-[1px] transition-all duration-500 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] md:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] md:dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
        >
            {/* Border Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            var(--primary),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="relative h-full flex flex-col overflow-hidden rounded-[31px] bg-bg-main/60 backdrop-blur-3xl border border-white/5 group-hover:bg-bg-main/40 transition-colors duration-500">
                {/* Image Section */}
                <div className="relative h-72 md:h-64 overflow-hidden bg-surface-2 p-2">
                    <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-[24px]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                        <img
                            src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            loading="lazy"
                        />
                    </div>

                    {/* Floating Premium Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <span className="glass-premium px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 backdrop-blur-2xl shadow-xl flex items-center gap-1.5 transform hover:scale-105 transition-transform cursor-default">
                            <Zap size={10} className="fill-primary" />
                            {item.category}
                        </span>

                        {/* New / Hot Badges */}
                        {(() => {
                            const createdDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || 0);
                            const isNew = (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
                            const isHot = (item.salesCount > 10) || (item.viewCount > 100);

                            return (
                                <>
                                    {isNew && (
                                        <span className="glass-premium px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/30 backdrop-blur-2xl shadow-xl flex items-center gap-1.5">
                                            <Star size={10} className="fill-emerald-400" />
                                            New Arrival
                                        </span>
                                    )}
                                    {isHot && (
                                        <span className="glass-premium px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-400 border border-orange-400/30 backdrop-blur-2xl shadow-xl flex items-center gap-1.5">
                                            <Zap size={10} className="fill-orange-400 text-orange-400 animate-pulse" />
                                            Hot Item
                                        </span>
                                    )}
                                </>
                            );
                        })()}

                        {type === 'service' && (
                            <span className="glass px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#3b82f6] border border-[#3b82f6]/30 backdrop-blur-2xl shadow-xl flex items-center gap-1.5">
                                <ShieldCheck size={10} className="fill-[#3b82f6]/20" />
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Elite Action Suite */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                        <button
                            onClick={(e) => { e.preventDefault(); toggleFavorite(item); }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 backdrop-blur-md border ${isInFavorites(item.id) ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-black/20 border-white/10 text-white hover:bg-white/10'}`}
                        >
                            <Heart size={18} className={isInFavorites(item.id) ? 'fill-primary' : ''} />
                        </button>
                    </div>

                    {/* Elite Action Button */}
                    <Link to={`/product/${item.id}`} className="absolute bottom-4 right-4 z-20 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black opacity-0 translate-y-4 translate-x-4 scale-75 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 group-hover:scale-100 transition-all duration-700 hover:bg-primary hover:text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.5)]">
                        <ArrowUpRight size={24} />
                    </Link>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                            <Star size={14} className="fill-secondary text-secondary" />
                            <span className="text-sm font-black text-text-primary leading-none uppercase tracking-tighter">{item.rating || '4.9'}</span>
                            <span className="text-[10px] font-bold text-text-muted opacity-60">({item.reviews || '24'})</span>
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80 decoration-primary decoration-2 underline-offset-4">
                            {type === 'product' ? '// Asset' : '// Service'}
                        </span>
                    </div>

                    <Link to={`/product/${item.id}`} className="no-underline group/title">
                        <h3 className="text-xl md:text-2xl font-display font-black text-text-primary mb-3 line-clamp-2 leading-[1.1] transition-all duration-500 group-hover/title:translate-x-1">
                            {item.title || item.name}
                        </h3>
                    </Link>

                    <p className="text-sm text-text-secondary line-clamp-2 mb-8 leading-relaxed font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                        {item.description || 'Professional grade digital asset tailored for modern African startups and creators.'}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                                <span className="text-[13px] font-black text-text-primary opacity-60">MK</span>
                                <span className="text-2xl font-display font-black text-primary tracking-tighter">
                                    {item.price.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.preventDefault(); addToCart(item); }}
                            className={`group/btn relative p-4 rounded-2xl border border-white/20 transition-all duration-500 flex-shrink-0 shadow-xl active:scale-95 hover:scale-110 hover:shadow-primary/20 ${isInCart(item.id) ? 'bg-primary' : 'bg-white/5'}`}
                        >
                            <ShoppingCart size={20} className={`relative z-10 ${isInCart(item.id) ? 'text-white' : 'text-text-primary'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
