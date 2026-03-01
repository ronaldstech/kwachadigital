import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ShoppingCart,
    ShieldCheck,
    Download,
    Clock,
    Star,
    MessageSquare,
    Send,
    Loader2,
    Link2,
    Heart,
    Presentation,
    FileText,
    Layers
} from 'lucide-react';
import { Star as StarIcon } from 'lucide-react';
import Rating from '../components/Rating';
import { toast } from 'react-hot-toast';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const PresentationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart, removeFromCart, toggleFavorite, isInCart, isInFavorites, loading: storeLoading } = useStore();

    const [product, setProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewerName, setReviewerName] = useState(user?.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return product?.rating?.toFixed(1) || '5.0';
        const sum = reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews, product]);

    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            setLoadingProduct(true);
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                    updateDoc(docRef, { viewCount: increment(1) }).catch(err => console.error(err));
                } else {
                    toast.error('Presentation not found.');
                    navigate('/yazam');
                }
            } catch (err) {
                console.error(err);
                toast.error('Could not load intelligence.');
            } finally {
                setLoadingProduct(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    useEffect(() => {
        if (!id) return;
        const q = query(collection(db, 'products', id, 'reviews'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoadingReviews(false);
        });
        return () => unsubscribe();
    }, [id]);

    const handleShare = () => {
        if (!user) {
            toast.error('Sign in to earn 10% on referrals!', { icon: '💸' });
            return;
        }
        const link = `${window.location.origin}/presentation/${id}?ref=${user.uid}`;

        const copyToClipboard = () => {
            const el = document.createElement('textarea');
            el.value = link;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            toast.success('Affiliate link copied! Earn 10% commission.', { icon: '💰' });
        };

        if (navigator.share) {
            navigator.share({
                title: product?.title,
                text: 'Check out this premium presentation!',
                url: link
            }).catch(() => copyToClipboard());
        } else {
            copyToClipboard();
        }
    };

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

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!rating || !reviewComment.trim() || !reviewerName.trim()) {
            toast.error('Please fill all fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const ref = collection(db, 'products', id, 'reviews');
            await addDoc(ref, {
                name: reviewerName,
                rating: Number(rating),
                comment: reviewComment,
                avatar: reviewerName.slice(0, 2).toUpperCase(),
                userId: user?.uid || null,
                createdAt: serverTimestamp()
            });

            const total = reviews.length + 1;
            const currentSum = reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
            const avg = ((currentSum + rating) / total).toFixed(1);

            await updateDoc(doc(db, 'products', id), {
                rating: Number(avg),
                reviews: total
            });

            setRating(0);
            setReviewComment('');
            if (!user?.name) setReviewerName('');
            toast.success('Review deployed');
        } catch (err) {
            console.error(err);
            toast.error('Review failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingProduct) return <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary" size={48} /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Analyzing Intel...</p></div>;
    if (!product) return null;

    const isPPTX = product.fileType?.toUpperCase() === 'PPTX';
    const pageLabel = isPPTX ? 'Slides' : 'Pages';

    return (
        <div className="relative min-h-screen pt-32 lg:pt-40 pb-32 overflow-hidden bg-bg-main">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="container relative z-10 px-4 md:px-12">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-text-muted hover:text-primary transition-all duration-500 mb-12 glass px-6 py-3 rounded-2xl">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Back to Repository</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <div className="relative aspect-video rounded-[40px] glass overflow-hidden shadow-2xl bg-surface-2 group">
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 flex items-center gap-4">
                                <div className="glass px-4 py-2 rounded-xl">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Deployment ID</span>
                                    <span className="text-xs font-mono font-bold">#YAZ-{id.slice(0, 6).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleShare} className="w-full flex items-center justify-between p-6 glass rounded-3xl border border-primary/20 hover:border-primary/50 transition-all group bg-primary/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Send size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary mb-1">Earn MWK {(product.price * 0.1).toLocaleString()}</p>
                                    <p className="text-sm font-bold text-text-primary">Share this Intelligence Package</p>
                                </div>
                            </div>
                            <Link2 size={20} className="text-primary opacity-40 group-hover:opacity-100" />
                        </button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                                {product.category}
                            </span>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 ${isPPTX ? 'text-orange-400 bg-orange-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                {isPPTX ? <Presentation size={14} /> : <FileText size={14} />}
                                {product.fileType || 'PDF'}
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-display font-black text-text-primary mb-8 tracking-tighter italic">
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-10 mb-12">
                            <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-2xl">
                                <Rating value={Number(averageRating)} size={16} />
                                <span className="text-xs font-black">{averageRating}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Layers size={18} className="text-primary" />
                                <span className="text-sm font-bold uppercase tracking-widest">{product.pageCount} {pageLabel}</span>
                            </div>
                        </div>

                        <div className="glass-premium p-10 rounded-[40px] mb-12 relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em] mb-4 block">Deployment Cost</span>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-display font-black text-text-primary tracking-tighter">
                                        MK {product.price?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-text-secondary text-xl font-medium leading-relaxed opacity-80 mb-12">
                            {product.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 mt-auto">
                            <button onClick={() => addToCart(product)} className="flex-[2] bg-primary text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm overflow-hidden shadow-2xl shadow-primary/30 active:scale-95 transition-all group">
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    {(cartLoading || storeLoading) ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={22} />}
                                    <span>{isInCart(id) ? 'Abort From Cart' : 'Deploy To Cart'}</span>
                                </div>
                            </button>
                            <button onClick={() => toggleFavorite(product)} className={`flex-1 py-6 rounded-[24px] glass font-black uppercase tracking-widest text-xs transition-all ${isInFavorites(id) ? 'text-primary bg-primary/10 border-primary/20' : 'text-text-primary hover:bg-white/10'}`}>
                                {isInFavorites(id) ? 'Favorited' : 'Add to Vault'}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Review System */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 border-t border-white/5 pt-32"
                >
                    <div className="flex flex-col lg:flex-row gap-20">
                        {/* Summary & Form */}
                        <div className="lg:w-[400px] shrink-0">
                            <h3 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic mb-2">Intelligence Feedback</h3>
                            <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-10 opacity-60">Quantify the impact of this asset.</p>

                            <form onSubmit={handleSubmitReview} className="glass-premium p-8 rounded-[40px] border-white/5 space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 block">Assign Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setRating(s)}
                                                onMouseEnter={() => setHover(s)}
                                                onMouseLeave={() => setHover(0)}
                                                className="transition-transform hover:scale-125"
                                            >
                                                <StarIcon
                                                    size={28}
                                                    className={`${(hover || rating) >= s ? 'fill-secondary text-secondary' : 'text-white/10'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 block">Reviewer Signature</label>
                                    <input
                                        type="text"
                                        placeholder="Identification Name"
                                        value={reviewerName}
                                        onChange={(e) => setReviewerName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 block">Intelligence Briefing</label>
                                    <textarea
                                        placeholder="Detailed feedback on asset performance..."
                                        rows="4"
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary/50 transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Deploy Review
                                </button>
                            </form>
                        </div>

                        {/* Public Reviews List */}
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                        <MessageSquare size={20} className="text-primary" />
                                    </div>
                                    <h4 className="text-2xl font-black text-text-primary tracking-tighter uppercase italic">Repository Logs</h4>
                                </div>
                                <div className="px-5 py-2 glass rounded-xl border-white/5 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    {reviews.length} VERIFIED ENTRIES
                                </div>
                            </div>

                            {loadingReviews ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-32 glass rounded-[60px] border-dashed border-white/5">
                                    <MessageSquare size={48} className="mx-auto text-text-muted mb-6 opacity-20" />
                                    <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[10px]">No communication logs available for this asset.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {reviews.map((rev) => (
                                        <motion.div
                                            key={rev.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            className="glass p-8 rounded-[40px] border-white/5 hover:border-primary/20 transition-all duration-500 group"
                                        >
                                            <div className="flex gap-6">
                                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center font-black text-xl text-primary border border-white/5 group-hover:border-primary/30 transition-all shrink-0 uppercase italic">
                                                    {rev.avatar || '??'}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h5 className="font-black text-text-primary text-xl tracking-tight mb-1">{rev.name}</h5>
                                                            <div className="flex items-center gap-3">
                                                                <Rating value={rev.rating} size={14} />
                                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{formatDate(rev.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[8px] font-black uppercase tracking-widest">
                                                            <ShieldCheck size={10} /> Verified
                                                        </div>
                                                    </div>
                                                    <p className="text-text-secondary font-medium leading-relaxed italic opacity-80">
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

export default PresentationDetail;
