import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, ShieldCheck, Download, Clock, Star, Users, MessageSquare, Send, Loader2, Link2, Heart, Check } from 'lucide-react';
import { Star as StarIcon } from 'lucide-react';
import Rating from '../components/Rating';
import { toast } from 'react-hot-toast';
import { doc, getDoc, setDoc, deleteDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Product state
    const [product, setProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);

    // Review state
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewerName, setReviewerName] = useState(user?.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Context state
    const { addToCart, removeFromCart, toggleFavorite, isInCart, isInFavorites, loading: storeLoading } = useStore();
    const [cartLoading, setCartLoading] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return '0.0';
        const sum = reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    // Review state

    // --- Fetch product document ---
    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            setLoadingProduct(true);
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });

                    // Increment viewCount asynchronously
                    updateDoc(docRef, {
                        viewCount: increment(1)
                    }).catch(err => console.error("Error incrementing viewCount:", err));
                } else {
                    toast.error('Product not found.');
                    navigate('/marketplace');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                toast.error('Could not load product.');
            } finally {
                setLoadingProduct(false);
            }
        };
        fetchProduct();
    }, [id]);

    // --- Realtime reviews listener ---
    useEffect(() => {
        if (!id) return;
        setLoadingReviews(true);
        const reviewsRef = collection(db, 'products', id, 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setReviews(data);
            setLoadingReviews(false);
        }, (err) => {
            console.error('Error fetching reviews:', err);
            setLoadingReviews(false);
        });
        return () => unsubscribe();
    }, [id]);

    // Pre-fill reviewer name from auth
    useEffect(() => {
        if (user?.name) setReviewerName(user.name);
    }, [user]);


    // --- Cart toggle ---
    const handleCartToggle = async () => {
        if (!product) return;
        setCartLoading(true);
        if (isInCart(id)) {
            await removeFromCart(id);
        } else {
            await addToCart(product);
        }
        setCartLoading(false);
    };

    // --- Favorites toggle ---
    const handleFavoritesToggle = async () => {
        if (!product) return;
        setFavLoading(true);
        await toggleFavorite(product);
        setFavLoading(false);
    };

    const handleShare = () => {
        if (!user) {
            toast.error('Sign in to earn 10% on referrals!', { icon: '💸' });
            return;
        }
        const link = `${window.location.origin}/product/${id}?ref=${user.uid}`;

        // Universal copy that works on HTTP and all mobile browsers
        const copyViaTextarea = () => {
            const el = document.createElement('textarea');
            el.value = link;
            el.setAttribute('readonly', '');
            el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
            document.body.appendChild(el);
            el.focus();
            el.select();
            el.setSelectionRange(0, 99999);
            const ok = document.execCommand('copy');
            document.body.removeChild(el);
            if (ok) {
                toast.success('Affiliate link copied! Earn 10% on success.', {
                    icon: '💰',
                    style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                });
            } else {
                toast.error('Could not copy automatically. Please copy this link: ' + link);
            }
        };

        // Use native share sheet if available (HTTPS mobile), otherwise copy
        if (navigator.share) {
            navigator.share({
                title: product?.title || 'Check out this product on Kwacha Digital',
                text: 'Get this asset! I earn 10% if you buy through my link.',
                url: link,
            }).catch(() => {
                // User dismissed the share sheet — fall back to copy
                copyViaTextarea();
            });
        } else {
            copyViaTextarea();
        }
    };

    const handlePurchase = handleCartToggle;

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!rating || !reviewComment.trim() || !reviewerName.trim()) {
            toast.error('Please provide a rating, your name, and a comment.');
            return;
        }
        setIsSubmitting(true);
        try {
            const reviewsRef = collection(db, 'products', id, 'reviews');
            const newReview = {
                name: reviewerName.trim(),
                rating: Number(rating),
                comment: reviewComment.trim(),
                avatar: reviewerName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                userId: user?.uid || null,
                createdAt: serverTimestamp()
            };

            await addDoc(reviewsRef, newReview);

            // Calculate new aggregates
            const totalReviews = reviews.length + 1;
            const currentSum = reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
            const newAverage = ((currentSum + Number(rating)) / totalReviews).toFixed(1);

            // Update product document with denormalized data
            const productRef = doc(db, 'products', id);
            await updateDoc(productRef, {
                rating: Number(newAverage),
                reviews: totalReviews
            });

            setRating(0);
            setReviewComment('');
            if (!user?.name) setReviewerName('');
            toast.success('Review published! Rating updated.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
        } catch (err) {
            console.error('Error saving review:', err);
            toast.error('Failed to publish review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Format timestamp ---
    const formatDate = (ts) => {
        if (!ts) return 'Just now';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    // Loading skeleton
    if (loadingProduct) {
        return (
            <div className="min-h-screen bg-bg-main flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary w-12 h-12" />
                    <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Loading asset...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const numericPrice = typeof product.price === 'string'
        ? parseFloat(product.price.replace(/,/g, ''))
        : Number(product.price) || 0;


    return (
        <div className="relative min-h-screen pt-32 lg:pt-40 pb-32 overflow-hidden bg-bg-main">
            {/* Immersive Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-12">
                {/* Back Button */}
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
                        <div className="relative aspect-square rounded-[40px] glass overflow-hidden group shadow-2xl bg-surface-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted/30">
                                    <ShieldCheck size={80} />
                                </div>
                            )}
                            {/* Asset ID badge */}
                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                <div className="glass px-4 py-2 rounded-xl backdrop-blur-md">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Asset ID</span>
                                    <span className="text-xs font-mono font-bold text-text-secondary">#KD-{id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary/20 glass flex items-center justify-center text-primary shadow-xl shadow-primary/20">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Product Link Card */}
                        {product.link && (
                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 glass-premium p-5 rounded-2xl border-white/5 hover:border-primary/30 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Link2 size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-0.5">Product Link</p>
                                    <p className="text-sm font-bold text-text-primary truncate">{product.link}</p>
                                </div>
                            </a>
                        )}

                        {/* ── Affiliate Share Button (below image, always visible) ── */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={handleShare}
                            className="w-full flex items-center justify-between p-5 glass rounded-2xl border border-primary/20 hover:border-primary/50 transition-all group bg-primary/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Send size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Refer & Earn MK {(numericPrice * 0.1).toLocaleString()}</p>
                                    <p className="text-xs font-bold text-text-primary">Share your unique affiliate link</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Link2 size={16} />
                            </div>
                        </motion.button>
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
                            {product.category && (
                                <span className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5">
                                    {product.category}
                                </span>
                            )}
                            <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest">
                                <Download size={16} className="text-primary" />
                                <span>Digital Asset</span>
                            </div>
                            {/* Status badge for the product itself */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${product.status === 'Approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                product.status === 'Declined' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                                    'text-amber-400 bg-amber-400/10 border-amber-400/20'
                                }`}>
                                {product.status}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-black text-text-primary mb-6 leading-[0.9] tracking-tighter">
                            {product.title}
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

                        {/* Pricing Block */}
                        <div className="glass-premium p-8 rounded-[32px] mb-12 border-glass-border bg-gradient-to-br from-bg-card to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em] mb-3">Price</div>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-5xl font-display font-black text-text-primary tracking-tighter">
                                        MK {numericPrice.toLocaleString()}
                                    </span>
                                    <span className="text-text-muted line-through text-lg font-bold mb-1 opacity-40">
                                        MK {(numericPrice * 1.5).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    Limited Time — 33% Early Bird Discount
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="space-y-8 mb-12">
                                <p className="text-text-secondary text-lg leading-relaxed font-medium opacity-80">
                                    {product.description}
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
                        )}

                        {/* Action Suite */}
                        <div className="flex flex-col sm:flex-row gap-5 mt-auto">
                            <button
                                onClick={handlePurchase}
                                className="group relative flex-grow bg-primary text-white py-6 rounded-[22px] font-black uppercase tracking-[0.3em] text-sm overflow-hidden shadow-2xl shadow-primary/30 active:scale-95 transition-all duration-500"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    {(cartLoading || storeLoading) ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={22} className="group-hover:rotate-12 transition-transform" />}
                                    <span>{isInCart(id) ? 'Remove Cart' : 'Add Cart'}</span>
                                </div>
                            </button>
                            <button
                                onClick={handleFavoritesToggle}
                                className={`px-10 py-6 rounded-[22px] glass font-black uppercase tracking-widest text-xs transition-all duration-500 active:scale-95 ${isInFavorites(id) ? 'text-primary bg-primary/10 border-primary/30' : 'text-text-primary hover:bg-white/10'}`}
                            >
                                {(favLoading || storeLoading) ? <Loader2 className="animate-spin inline mr-2" size={14} /> : null}
                                {isInFavorites(id) ? 'Favorited' : 'Add to Favorites'}
                            </button>
                        </div>
                        {/* Creator Footprint */}
                        <div className="mt-12 pt-8 border-t border-glass-border flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center font-black text-2xl text-primary border border-primary/20 shadow-xl shadow-primary/5">
                                    {(product.userName || product.creator || 'KD').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Creator</div>
                                    <div className="text-text-primary font-black text-lg">{product.userName || product.creator || 'Kwacha Network'}</div>
                                </div>
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
                                        disabled={isSubmitting}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        {isSubmitting ? 'Publishing...' : 'Publish Review'}
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

                            {loadingReviews ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="glass-premium p-12 rounded-[40px] text-center border-white/5">
                                    <MessageSquare size={32} className="text-primary mx-auto mb-4 opacity-50" />
                                    <p className="text-text-muted font-bold">No reviews yet. Be the first!</p>
                                </div>
                            ) : (
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
                                                    {rev.avatar || '??'}
                                                </div>
                                                <div className="flex-grow space-y-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                        <div>
                                                            <h4 className="font-black text-text-primary text-lg">{rev.name}</h4>
                                                            <div className="flex items-center gap-3">
                                                                <Rating value={rev.rating} size={14} />
                                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{formatDate(rev.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                                            <ShieldCheck size={12} /> Verified
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
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;
