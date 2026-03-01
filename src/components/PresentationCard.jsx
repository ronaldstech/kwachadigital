import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Presentation, Star, ShoppingCart, ShoppingBag, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const PresentationCard = ({ item }) => {
    const { addToCart, isInCart } = useStore();
    const { user } = useAuth();

    const isPPTX = item.fileType?.toUpperCase() === 'PPTX';
    const pageLabel = isPPTX ? 'Slides' : 'Pages';

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group relative bg-surface-1/40 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] flex flex-col h-full"
        >
            {/* Header / Image Area */}
            <Link to={`/presentation/${item.id}`} className="relative aspect-[16/10] overflow-hidden bg-surface-2 block">
                <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary-light">
                        {item.category}
                    </span>
                </div>

                {/* Rating & Reviews */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                    <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1.5">
                        <Star size={10} className="fill-secondary text-secondary" />
                        <span className="text-[10px] font-black text-white">{(item.rating || 5.0).toFixed(1)}</span>
                    </div>
                    {item.reviews > 0 && (
                        <div className="px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/20 rounded-full flex items-center gap-1.5">
                            <span className="text-[8px] font-black text-primary-light uppercase tracking-widest">{item.reviews} Reviews</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <Link to={`/presentation/${item.id}`}>
                        <h3 className="text-lg font-bold text-text-primary tracking-tight leading-tight group-hover:text-primary transition-colors duration-300 uppercase mb-3 line-clamp-1">
                            {item.title}
                        </h3>
                    </Link>

                    {/* Metadata Section - Moved out of image */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 bg-white/5 ${isPPTX ? 'text-orange-400' : 'text-red-400'}`}>
                            {isPPTX ? <Presentation size={10} /> : <FileText size={10} />}
                            {item.fileType || 'PDF'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                            <span className="text-text-primary font-black italic">{item.pageCount || '?'}</span>
                            <span className="uppercase tracking-widest opacity-60 text-[8px]">{pageLabel}</span>
                        </div>
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed font-medium">
                        {item.description || "Premium expert-crafted presentation deck optimized for high-stakes business impact."}
                    </p>
                </div>

                {/* Action Area */}
                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Valuation</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs font-bold text-primary italic">K</span>
                                <span className="text-xl font-black text-text-primary tabular-nums tracking-tighter">
                                    {(Number(item.price) || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                to={`/presentation/${item.id}`}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-lg"
                                title="View Details"
                            >
                                <Info size={18} />
                            </Link>
                            <button
                                onClick={() => addToCart(item)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-2xl ${isInCart(item.id)
                                    ? 'bg-primary text-white shadow-primary/20'
                                    : 'bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-text-primary hover:text-white'
                                    }`}
                            >
                                {isInCart(item.id) ? <ShoppingBag size={20} /> : <ShoppingCart size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Footer Extra */}
                    <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Intelligence Verified</span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                </div>
            </div>

            {/* Animated Bottom Glow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
};

export default PresentationCard;
