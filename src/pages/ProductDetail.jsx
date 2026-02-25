import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, ShieldCheck, Download, Clock, Star, Users, MessageSquare, Send, User, Star as StarIcon } from 'lucide-react';
import Rating from '../components/Rating';
import { PRESENTATIONS, SERVICES } from '../constants';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [reviews, setReviews] = useState([
        {
            id: 1,
            name: "Limbani Phiri",
            rating: 5,
            comment: "Absolutely game-changing for my agency. The quality is unmatched in the Malawian market.",
            date: "2 days ago",
            avatar: "LP"
        },
        {
            id: 2,
            name: "Chisomo Banda",
            rating: 4,
            comment: "Very professional assets. Helped me close a client in record time. Would recommend!",
            date: "1 week ago",
            avatar: "CB"
        }
    ]);

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
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
            }
        });
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!rating || !reviewComment || !reviewerName) {
            toast.error("Please provide a rating, name, and comment.", {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
            return;
        }

        const newReviewObj = {
            id: Date.now(),
            name: reviewerName,
            rating,
            comment: reviewComment,
            date: "Just now",
            avatar: reviewerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        };

        setReviews([newReviewObj, ...reviews]);
        setRating(0);
        setReviewComment('');
        setReviewerName('');

        toast.success("Review submitted! Thank you for your feedback.", {
            style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
    };

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        return (total / reviews.length).toFixed(1);
    }, [reviews]);

    return (
        <div className="relative min-h-screen pt-32 lg:pt-40 pb-32 overflow-hidden bg-bg-main">
            {/* Immersive Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-12">
                {/* Elite Navigation */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-text-muted hover:text-primary transition-all duration-500 mb-12 glass px-6 py-3 rounded-2xl"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Return to Arcade</span>
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Visual Showcase Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="relative aspect-square rounded-[40px] glass overflow-hidden group shadow-2xl">
                            {/* Spotlight Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                            <div
                                className="absolute inset-0 flex items-center justify-center text-[180px] md:text-[240px] lg:text-[280px] filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                style={{ color: item.color || 'var(--primary)' }}
                            >
                                {item.icon}
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                <div className="glass px-4 py-2 rounded-xl backdrop-blur-md">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Asset ID</span>
                                    <span className="text-xs font-mono font-bold text-text-secondary">#KD-{item.id}-{new Date().getFullYear()}</span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary/20 glass flex items-center justify-center text-primary shadow-xl shadow-primary/20">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>
                        </div>

                        {/* High-End Gallery Thumbnails */}
                        <div className="grid grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="aspect-square rounded-3xl glass flex items-center justify-center text-4xl cursor-pointer group transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
                                        {item.icon}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Elite Information Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col h-full"
                    >
                        {/* Status Bar */}
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5">
                                {item.category}
                            </span>
                            <div className="h-1 w-1 bg-text-muted/20 rounded-full" />
                            {isService ? (
                                <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest">
                                    <Users size={16} className="text-primary" />
                                    <span>{item.users} Elite Clients</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest">
                                    <Download size={16} className="text-primary" />
                                    <span>{item.sales} Global Sales</span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-black text-text-primary mb-6 leading-[0.9] tracking-tighter">
                            {item.name}
                        </h1>

                        <div className="flex items-center gap-6 mb-10 overflow-hidden">
                            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
                                <Rating value={Number(averageRating)} size={16} />
                                <span className="text-xs font-black text-text-primary">{averageRating}</span>
                            </div>
                            <div className="h-8 w-px bg-glass-border" />
                            <span className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                <MessageSquare size={16} className="text-primary" /> {reviews.length} Reviews
                            </span>
                        </div>

                        {/* Elite Pricing Desk */}
                        <div className="glass-premium p-8 rounded-[32px] mb-12 border-glass-border bg-gradient-to-br from-bg-card to-transparent relative overflow-hidden group text-text-primary">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em] mb-3">Investment Range</div>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-5xl font-display font-black text-text-primary tracking-tighter">
                                        MK {item.price}
                                    </span>
                                    {!isService && (
                                        <span className="text-text-muted line-through text-lg font-bold mb-1 opacity-40">
                                            MK {(parseInt(item.price.replace(/,/g, '')) * 1.5).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    Limited Time Offer: 50% Early Bird Access
                                </div>
                            </div>
                        </div>

                        {/* Product Narrative */}
                        <div className="space-y-8 mb-12">
                            <p className="text-text-secondary text-lg leading-relaxed font-medium opacity-80">
                                This high-quality {isService ? 'digital service' : 'digital product'} is engineered to empower African startups with professional-grade tactical assets. Transform your workflow and scale your operations with Malawi's premier digital infrastructure.
                            </p>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <li className="flex items-center gap-3 glass p-4 rounded-2xl group hover:border-primary/30 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-text-primary">Secured Asset</span>
                                </li>
                                <li className="flex items-center gap-3 glass p-4 rounded-2xl group hover:border-primary/30 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Clock size={20} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-text-primary">Prime Delivery</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Suite */}
                        <div className="flex flex-col sm:flex-row gap-5 mt-auto">
                            <button
                                onClick={handlePurchase}
                                className="group relative flex-grow bg-primary text-white py-6 rounded-[22px] font-black uppercase tracking-[0.3em] text-sm overflow-hidden shadow-2xl shadow-primary/30 active:scale-95 transition-all duration-500"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    <ShoppingCart size={22} className="group-hover:rotate-12 transition-transform" />
                                    <span>Initiate Acquisition</span>
                                </div>
                            </button>
                            <button className="px-10 py-6 rounded-[22px] glass font-black uppercase tracking-widest text-xs text-text-primary hover:bg-white/10 active:scale-95 transition-all duration-500">
                                Add to Vault
                            </button>
                        </div>

                        {/* Creator Footprint */}
                        <div className="mt-12 pt-8 border-t border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center font-black text-2xl text-primary border border-primary/20 shadow-xl shadow-primary/5">
                                    {item.creator ? item.creator.slice(0, 2) : 'KD'}
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Elite Architect</div>
                                    <div className="text-text-primary font-black text-lg">{item.creator || 'Kwacha Network'}</div>
                                </div>
                            </div>
                            <div className="hidden sm:flex flex-col items-end">
                                <div className="flex -space-x-3 mb-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-main bg-surface-2 overflow-hidden glass shadow-lg">
                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">U{i}</div>
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-bg-main bg-primary flex items-center justify-center text-[8px] font-black text-white shadow-lg">
                                        +50
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Acquired by top creators</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Review & Engagement System */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-24 lg:mt-32"
                >
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Review Submission Form */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-40">
                                <h3 className="text-2xl font-display font-black text-text-primary mb-2">Rate your experience</h3>
                                <p className="text-text-secondary text-sm font-medium mb-8">Share your thoughts with the community.</p>

                                <form onSubmit={handleSubmitReview} className="glass-premium p-8 rounded-[32px] border-glass-border space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 block">Select Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHover(star)}
                                                    onMouseLeave={() => setHover(0)}
                                                    className="transition-all duration-300 transform hover:scale-125"
                                                >
                                                    <StarIcon
                                                        size={28}
                                                        className={`${(hover || rating) >= star ? 'fill-secondary text-secondary' : 'text-text-muted'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Your Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Kondwani Mwale"
                                            value={reviewerName}
                                            onChange={(e) => setReviewerName(e.target.value)}
                                            className="w-full glass bg-white/5 border-glass-border rounded-xl px-5 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Feedback Details</label>
                                        <textarea
                                            placeholder="What did you think of this asset?"
                                            rows="4"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            className="w-full glass bg-white/5 border-glass-border rounded-xl px-5 py-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                                    >
                                        <Send size={14} /> Publish Review
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Public Reviews List */}
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-12">
                                <h3 className="text-2xl font-display font-black text-text-primary">Creator Feedback</h3>
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-glass-border">
                                    {reviews.length} Verified Reviews
                                </div>
                            </div>

                            <div className="space-y-8">
                                {reviews.map((rev) => (
                                    <motion.div
                                        key={rev.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass p-8 rounded-[32px] border-glass-border relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-xl text-primary shrink-0 border border-primary/20">
                                                {rev.avatar}
                                            </div>
                                            <div className="flex-grow space-y-3">
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-black text-text-primary text-lg">{rev.name}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <Rating value={rev.rating} size={14} />
                                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{rev.date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                                        <ShieldCheck size={12} /> Verified Acquisition
                                                    </div>
                                                </div>
                                                <p className="text-text-secondary font-medium leading-relaxed italic">
                                                    "{rev.comment}"
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;
