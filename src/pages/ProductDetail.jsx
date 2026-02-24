import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, ShieldCheck, Download, Clock, Star, Users, MessageSquare } from 'lucide-react';
import Rating from '../components/Rating';
import { PRESENTATIONS, SERVICES } from '../constants';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    // Combine items to find the current one
    const item = useMemo(() => {
        const allItems = [...PRESENTATIONS, ...SERVICES];
        return allItems.find(i => i.id.toString() === id) || PRESENTATIONS[0];
    }, [id]);

    const isService = SERVICES.some(s => s.id.toString() === id);

    const handlePurchase = () => {
        toast.success(`Redirecting to secure checkout for ${item.name}...`, {
            style: {
                background: '#111',
                color: '#fff',
                border: '1px solid var(--glass-border)'
            }
        });
    };

    return (
        <div className="pt-32 pb-20 container">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8 bg-transparent border-none cursor-pointer"
            >
                <ArrowLeft size={20} /> Back to Marketplace
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Visuals Column */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-6"
                >
                    <div
                        className="aspect-square rounded-3xl flex items-center justify-center text-9xl shadow-2xl relative overflow-hidden"
                        style={{ background: item.color || 'var(--surface-2)' }}
                    >
                        <div className="absolute inset-0 bg-black/10" />
                        <span className="drop-shadow-2xl z-10">{item.icon}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square rounded-2xl glass flex items-center justify-center text-3xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                                {item.icon}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Info Column */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                            {item.category}
                        </span>
                        {isService ? (
                            <span className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                                <Users size={14} /> {item.users} Happy Clients
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                                <Download size={14} /> {item.sales} Sales
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
                        {item.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-8">
                        <Rating value={item.rating} size={20} />
                        <span className="text-text-muted">|</span>
                        <span className="text-text-secondary flex items-center gap-2">
                            <MessageSquare size={16} /> 24 Reviews
                        </span>
                    </div>

                    <div className="glass p-8 rounded-3xl mb-10 border-l-4 border-l-primary">
                        <div className="text-sm text-text-muted uppercase font-bold tracking-tighter mb-1">Current Price</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-text-primary">MK {item.price}</span>
                            {!isService && <span className="text-text-muted line-through text-lg">MK {(parseInt(item.price.replace(/,/g, '')) * 1.5).toLocaleString()}</span>}
                        </div>
                    </div>

                    <div className="prose prose-invert mb-10">
                        <p className="text-text-secondary text-lg leading-relaxed">
                            This high-quality {isService ? 'digital service' : 'digital product'} is designed to help African entrepreneurs and startups scale their operations with professional-grade assets.
                            Included in this package are lifetime updates and 24/7 priority support.
                        </p>
                        <ul className="mt-6 flex flex-col gap-3 text-text-primary">
                            <li className="flex items-center gap-3"><ShieldCheck size={18} className="text-primary" /> 100% Satisfaction Guarantee</li>
                            <li className="flex items-center gap-3"><Clock size={18} className="text-primary" /> {isService ? 'Delivery within 48-72 hours' : 'Instant digital delivery'}</li>
                            <li className="flex items-center gap-3"><Download size={18} className="text-primary" /> {isService ? 'Customized deliverables' : 'Direct secure download'}</li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        <button
                            onClick={handlePurchase}
                            className="btn btn-primary flex-grow py-5 text-xl"
                        >
                            <ShoppingCart size={24} /> Buy Now
                        </button>
                        <button className="btn btn-outline py-5 px-8">
                            Add to Cart
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-glass-border flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary border border-glass-border">
                            {item.creator ? item.creator.slice(0, 2) : 'KD'}
                        </div>
                        <div>
                            <div className="text-sm text-text-muted">Created by</div>
                            <div className="text-text-primary font-bold">{item.creator || 'Kwacha Verified Creator'}</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;
