import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    X,
    Cpu,
    ArrowRight,
    Trash2,
    ExternalLink,
    Link2,
    ChevronDown,
    ShieldCheck,
    Zap,
    AlertTriangle,
    Edit2,
    Phone,
    PlusCircle,
    Package,
    Plus,
    Upload,
    Search,
    Filter,
    MoreVertical,
    DollarSign, User
} from 'lucide-react';



import { toast } from 'react-hot-toast';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';


const Categories = [
    'Apps',
    'Courses',
    'E-books',
    'Presentations',
    'Graphics',
    'Source Code',
    'Services'
];

const ProductCard = ({ product, currentUserId, isAdmin }) => {
    const isOwner = product.userId === currentUserId;

    const statusStyles = {
        Approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]",
        Declined: "text-red-400 bg-red-400/10 border-red-400/20",
        Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
    };

    const activeStyle = statusStyles[product.status] || statusStyles.Pending;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            className="group relative bg-surface-1/60 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl shadow-black/40 p-4 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
        >
            {/* Ambient Background Glow */}
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${product.status === 'Approved' ? 'bg-emerald-500/10' : 'bg-primary/10'}`} />

            {/* Image Section - Now Cleaner */}
            <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden bg-surface-2 border border-white/5 mb-5">
                <div className="absolute top-3 left-3 z-20">
                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/90">{product.category}</span>
                    </div>
                </div>

                <div className="w-full h-full group-hover:scale-105 transition-transform duration-1000 ease-out">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-3/50">
                            <Package size={32} className="text-text-muted opacity-20" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="px-1 flex flex-col flex-grow gap-5">
                {/* Title & Creator */}
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text-primary tracking-tight leading-tight group-hover:text-primary transition-colors duration-300 uppercase">
                        {product.title}
                    </h3>
                    {isAdmin && !isOwner && (
                        <div className="flex items-center gap-2 opacity-60">
                            <div className="w-4 h-4 rounded-full bg-surface-3 flex items-center justify-center">
                                <User size={10} className="text-text-primary" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                                Node: {product.userName || 'Root'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Status & Valuation Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Asset Status</span>
                        <div className={`w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${activeStyle}`}>
                            {product.status === 'Approved' ? <CheckCircle2 size={10} /> : product.status === 'Declined' ? <X size={10} /> : <Clock size={10} />}
                            {product.status}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5 border-l border-white/5 pl-3">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Market Price</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-bold text-primary">K</span>
                            <span className="text-base font-black text-text-primary tabular-nums">
                                {product.price?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Decline Reason Alert */}
                {product.status === 'Declined' && product.declineReason && (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 mt-1 relative z-10">
                        <span className="text-[9px] font-black text-red-500/80 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <AlertTriangle size={10} />
                            Moderator Note
                        </span>
                        <p className="text-xs text-text-muted leading-relaxed font-medium">
                            {product.declineReason}
                        </p>
                    </div>
                )}

                {/* Action Dock */}

                <div className="flex items-center justify-between gap-2 mt-auto">
                    {isOwner ? (
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-2 bg-primary/10 rounded-xl border border-primary/20">
                                <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Ownership Confirmed</span>
                            </div>
                        </div>
                    ) : <div />}

                    <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-white/5 shadow-inner">
                        {product.externalLink && (
                            <a href={product.externalLink} target="_blank" className="p-2 hover:bg-surface-3 text-text-muted hover:text-primary transition-all rounded-lg">
                                <ExternalLink size={14} />
                            </a>
                        )}

                        {(isAdmin || isOwner) && (
                            <>
                                <div className="w-[1px] h-3 bg-white/10 mx-1" />
                                {isAdmin && product.status === 'Pending' && (
                                    <>
                                        <button onClick={() => product.onStatusUpdate(product.id, 'Approved')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Approve">
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <button onClick={() => product.onDecline(product)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Decline">
                                            <X size={14} />
                                        </button>
                                    </>
                                )}
                                {isOwner && (
                                    <button onClick={() => product.onEdit(product)} className="p-2 text-text-muted hover:text-white rounded-lg transition-all">
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                <button onClick={() => product.onDelete(product)} className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Products = () => {

    const { user } = useAuth();
    const [showUpload, setShowUpload] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userProducts, setUserProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [productToDecline, setProductToDecline] = useState(null);

    useEffect(() => {
        const isAdmin = user.role === 'admin';
        const q = isAdmin
            ? query(collection(db, 'products'), orderBy('createdAt', 'desc'))
            : query(
                collection(db, 'products'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isAdmin: isAdmin,
                onDelete: (p) => setProductToDelete(p),
                onEdit: (p) => setProductToEdit(p),
                onStatusUpdate: (id, status) => handleStatusUpdate(id, status),
                onDecline: (p) => setProductToDecline(p)
            }));
            setUserProducts(productsData);
            setLoading(false);
        }, (error) => {


            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'products', id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            toast.success(`Product ${newStatus.toLowerCase()}`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDeclineSubmit = async (e) => {
        e.preventDefault();
        if (!productToDecline) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData(e.target);
            const reason = formData.get('reason');

            await updateDoc(doc(db, 'products', productToDecline.id), {
                status: 'Declined',
                declineReason: reason,
                updatedAt: serverTimestamp()
            });
            toast.success('Asset declined with feedback.');
            setProductToDecline(null);
        } catch (error) {
            console.error("Error declining status:", error);
            toast.error("Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {

        if (!productToDelete) return;

        setIsSubmitting(true);
        try {
            await deleteDoc(doc(db, 'products', productToDelete.id));
            toast.success('Asset deleted successfully');
            setProductToDelete(null);
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error('Failed to delete asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user || !productToEdit) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData(e.target);
            let imageUrl = productToEdit.imageUrl;

            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);

                const response = await fetch('https://unimarket-mw.com/kwachadigital/api/upload.php', {
                    method: 'POST',
                    body: uploadData,
                });

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.error);
                }

                imageUrl = result.url;
            }

            const updatedData = {
                title: formData.get('title'),
                category: formData.get('category'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                originalPrice: parseFloat(formData.get('originalPrice')) || 0,
                externalLink: formData.get('externalLink') || '',
                imageUrl,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'products', productToEdit.id), updatedData);

            setIsSubmitting(false);
            setProductToEdit(null);
            setPreviewImage(null);
            setSelectedFile(null);
            toast.success('Asset updated successfully');
        } catch (error) {
            console.error("Error updating product:", error.message || error);
            setIsSubmitting(false);
            toast.error(error.message || 'Failed to update asset');
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData(e.target);
            let imageUrl = '';

            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);

                const response = await fetch('https://unimarket-mw.com/kwachadigital/api/upload.php', {
                    method: 'POST',
                    body: uploadData,
                });

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.error);
                }

                imageUrl = result.url;
            }

            const productData = {
                title: formData.get('title'),
                category: formData.get('category'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                originalPrice: parseFloat(formData.get('originalPrice')) || 0,
                externalLink: formData.get('externalLink') || '',
                status: 'Pending',
                userId: user.uid,
                userName: user.name,
                imageUrl,
                createdAt: serverTimestamp()
            };


            await addDoc(collection(db, 'products'), productData);

            setIsSubmitting(false);
            setShowUpload(false);
            setPreviewImage(null);
            setSelectedFile(null);
            toast.success('Product uploaded for review.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(245,158,11,0.2)' }
            });
        } catch (error) {
            console.error("Error uploading product:", error.message || error);
            setIsSubmitting(false);
            toast.error(error.message || 'Failed to upload asset');
        }
    };



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2">
                        Digital <span className="text-primary italic">Vault</span>
                    </h1>
                    <p className="text-text-muted font-bold flex items-center gap-2">
                        <Package size={16} className="text-primary" />
                        Manage your assets and upload new prototypes.
                    </p>
                </div>

                <button
                    onClick={() => setShowUpload(true)}
                    className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] group self-start"
                >
                    <Plus size={20} />
                    <span className="font-black uppercase tracking-widest text-xs">Upload Asset</span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search your inventory..."
                        className="w-full pl-12 pr-4 py-3.5 glass border-glass-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white/5"
                    />
                </div>
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 glass border-glass-border rounded-2xl text-sm font-bold text-text-muted hover:text-primary hover:bg-white/5 transition-all">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {userProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <ProductCard
                                product={product}
                                currentUserId={user?.uid}
                                isAdmin={user?.role === 'admin'}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Loading/Empty State */}

            {
                loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Cpu className="animate-spin text-primary mb-4" size={40} />
                        <p className="text-sm text-text-muted font-bold">Synchronizing with the Forge...</p>
                    </div>
                ) : userProducts.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center text-text-muted mb-6 border border-glass-border">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">No assets found</h3>
                        <p className="max-w-xs text-sm text-text-muted font-bold">Your digital forge is currently cold. Upload your first product to start.</p>
                    </div>
                )
            }


            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setShowUpload(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="relative w-full max-w-2xl bg-surface-1/90 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with Gradient Accent */}
                            <div className="relative p-10 pb-6 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase">
                                            Deploy <span className="text-primary">Asset</span>
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setShowUpload(false)}
                                        className="group p-3 hover:bg-red-500/10 rounded-2xl border border-border-main transition-all text-text-muted hover:text-red-500"
                                        disabled={isSubmitting}
                                    >
                                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-8 overflow-y-auto max-h-[65vh] custom-scrollbar">

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Asset Identity</label>
                                        <input
                                            required
                                            name="title"
                                            className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-text-primary font-bold placeholder:text-text-muted/30"
                                            placeholder="Modern SaaS Template"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Classification</label>
                                        <div className="relative">
                                            <select required name="category" className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-bold appearance-none cursor-pointer">
                                                {Categories.map(cat => <option key={cat} value={cat} className="bg-surface-1">{cat}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Asset Description</label>
                                    <textarea
                                        required
                                        name="description"
                                        className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-medium min-h-[120px] resize-none"
                                        placeholder="Describe the utility and architecture..."
                                    />
                                </div>

                                {/* Pricing & Link */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Valuation (MWK)</label>
                                        <div className="relative group">
                                            <div className="absolute left-1 top-1 bottom-1 w-12 flex items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
                                                K
                                            </div>
                                            <input required name="price" type="number" className="w-full pl-16 pr-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-black text-lg" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Original Price (optional)</label>
                                        <div className="relative group">
                                            <div className="absolute left-1 top-1 bottom-1 w-12 flex items-center justify-center rounded-xl bg-surface-3 text-text-muted font-black">
                                                K
                                            </div>
                                            <input name="originalPrice" type="number" className="w-full pl-16 pr-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-muted font-black text-lg" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Link (optional)</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/50">
                                                <Link2 size={18} />
                                            </div>
                                            <input name="externalLink" type="url" className="w-full pl-14 pr-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-medium" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Zone - Enhanced with Glass Effect */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Image Preview</label>
                                    <div className="relative h-[160px] group/upload">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full opacity-0 cursor-pointer z-20" />
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all duration-500 ${previewImage ? 'border-primary bg-primary/10 shadow-[inset_0_0_40px_rgba(var(--primary-rgb),0.1)]' : 'border-white/10 bg-white/5 group-hover/upload:border-primary/40 group-hover/upload:bg-primary/5'}`}>
                                            {previewImage ? (
                                                <div className="relative flex flex-col items-center">
                                                    <img src={previewImage} alt="Preview" className="absolute -top-10 w-24 h-24 object-cover rounded-full blur-2xl opacity-40" />
                                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl rotate-3 mb-3">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Signature Verified</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-14 h-14 rounded-3xl bg-surface-3 flex items-center justify-center text-text-muted group-hover/upload:scale-110 group-hover/upload:text-primary transition-all duration-500 shadow-xl">
                                                        <Upload size={24} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Upload High-Res Core</p>
                                                        <p className="text-[9px] text-text-muted font-bold mt-1 opacity-50">HEIC, WEBP, PNG (MAX 10MB)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Audit Warning */}
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex gap-5 items-center">
                                    <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 animate-pulse">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Integrity Audit Active</p>
                                        <p className="text-[11px] text-text-muted/80 font-medium leading-tight">
                                            Assets are verified for security. Final deployment cycles conclude within 24 hours.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(false)}
                                        className="flex-1 py-5 bg-surface-2/50 hover:bg-red-500/10 border border-white/5 rounded-3xl font-black uppercase tracking-widest text-[10px] text-text-muted hover:text-red-500 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2.5] py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_25px_50px_rgba(var(--primary-rgb),0.5)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Cpu className="animate-spin" size={18} />
                                        ) : (
                                            <>
                                                Upload
                                                <Zap size={16} fill="currentColor" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {productToEdit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setProductToEdit(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="relative w-full max-w-2xl bg-surface-1/90 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative p-10 pb-6 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                <div className="flex items-center justify-between relative z-10">
                                    <h2 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase">
                                        Edit <span className="text-primary">Asset</span>
                                    </h2>
                                    <button
                                        onClick={() => setProductToEdit(null)}
                                        className="group p-3 hover:bg-white/10 rounded-2xl border border-border-main transition-all text-text-muted hover:text-text-primary"
                                        disabled={isSubmitting}
                                    >
                                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="px-10 pb-10 space-y-8 overflow-y-auto max-h-[65vh] custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Asset Identity</label>
                                        <input
                                            required
                                            name="title"
                                            defaultValue={productToEdit.title}
                                            className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-text-primary font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Classification</label>
                                        <div className="relative">
                                            <select required name="category" defaultValue={productToEdit.category} className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-bold appearance-none cursor-pointer">
                                                {Categories.map(cat => <option key={cat} value={cat} className="bg-surface-1">{cat}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Asset Description</label>
                                    <textarea
                                        required
                                        name="description"
                                        defaultValue={productToEdit.description}
                                        className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-medium min-h-[120px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Valuation (MWK)</label>
                                        <div className="relative group">
                                            <div className="absolute left-1 top-1 bottom-1 w-12 flex items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
                                                K
                                            </div>
                                            <input required name="price" type="number" defaultValue={productToEdit.price} className="w-full pl-16 pr-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-black text-lg" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Original Price (optional)</label>
                                        <div className="relative group">
                                            <div className="absolute left-1 top-1 bottom-1 w-12 flex items-center justify-center rounded-xl bg-surface-3 text-text-muted font-black">
                                                K
                                            </div>
                                            <input name="originalPrice" type="number" defaultValue={productToEdit.originalPrice} className="w-full pl-16 pr-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-muted font-black text-lg" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Link (optional)</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/50">
                                                <Link2 size={18} />
                                            </div>
                                            <input name="externalLink" type="url" defaultValue={productToEdit.externalLink} className="w-full pl-14 pr-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-medium" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Update Core Image (optional)</label>
                                    <div className="relative h-[160px] group/upload">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full opacity-0 cursor-pointer z-20" />
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all duration-500 ${previewImage || productToEdit.imageUrl ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 group-hover/upload:border-primary/40'}`}>
                                            {(previewImage || productToEdit.imageUrl) ? (
                                                <div className="relative flex flex-col items-center">
                                                    <img src={previewImage || productToEdit.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-2xl mb-2 border border-white/10" />
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Core Ready</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4">
                                                    <Upload size={24} className="text-text-muted transition-transform group-hover/upload:-translate-y-1" />
                                                    <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Swap Core File</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setProductToEdit(null)}
                                        className="flex-1 py-5 bg-surface-2/50 hover:bg-white/10 border border-white/5 rounded-3xl font-black uppercase tracking-widest text-[10px] text-text-muted transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2.5] py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Cpu className="animate-spin" size={18} /> : <>Update Asset <Zap size={16} fill="currentColor" /></>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {productToDelete && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => !isSubmitting && setProductToDelete(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-surface-1 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-[24px] flex items-center justify-center text-red-500 mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter mb-2">Delete Asset?</h2>
                            <p className="text-text-muted text-sm font-medium mb-8">
                                This action is irreversible. The asset "<span className="text-text-primary font-bold">{productToDelete.title}</span>" will be permanently erased from the digital vault.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Cpu className="animate-spin" size={16} /> : "Finalize Delete"}
                                </button>
                                <button
                                    onClick={() => setProductToDelete(null)}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-surface-2 border border-white/5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-text-muted hover:bg-white/5 transition-all"
                                >
                                    Abort Action
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Decline Modal */}
            <AnimatePresence>
                {productToDecline && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => !isSubmitting && setProductToDecline(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-surface-1 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter">Decline Asset</h2>
                                    <p className="text-text-muted text-[11px] font-bold">Provide feedback to the owner</p>
                                </div>
                            </div>

                            <form onSubmit={handleDeclineSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-red-500 ml-1">Reason for Decline</label>
                                    <textarea
                                        required
                                        name="reason"
                                        className="w-full px-5 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-red-500/50 transition-all text-text-primary font-medium min-h-[120px] resize-none text-sm placeholder:text-text-muted/30"
                                        placeholder="Explain why this asset does not meet quality standards..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setProductToDecline(null)}
                                        disabled={isSubmitting}
                                        className="flex-1 py-4 bg-surface-2 border border-white/5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-text-muted hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Cpu className="animate-spin" size={16} /> : "Submit Decision"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};

export default Products;

