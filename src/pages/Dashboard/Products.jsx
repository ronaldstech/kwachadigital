import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Plus,
    Upload,
    DollarSign,
    Tag,
    Layout,
    FileText,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    Clock,
    X,
    Cpu,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Categories = [
    'Apps',
    'Courses',
    'E-books',
    'Presentations',
    'Graphics',
    'Source Code',
    'Services'
];

const ProductCard = ({ product }) => (
    <div className="glass-premium p-4 rounded-[28px] border-glass-border hover:border-primary/30 transition-all group">
        <div className="aspect-[4/3] rounded-2xl bg-surface-2 border border-glass-border mb-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                <Package size={32} />
            </div>
            <div className="absolute top-3 left-3 px-3 py-1 bg-bg-main/80 backdrop-blur-md rounded-full border border-glass-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{product.category}</span>
            </div>
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${product.status === 'Approved'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                {product.status === 'Approved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                {product.status}
            </div>
        </div>
        <h3 className="text-sm font-bold text-text-primary mb-1 truncate">{product.title}</h3>
        <div className="flex items-center justify-between">
            <span className="text-primary font-black text-sm">{product.price}</span>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted">
                <MoreVertical size={16} />
            </button>
        </div>
    </div>
);

const Products = () => {
    const [showUpload, setShowUpload] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userProducts, setUserProducts] = useState([
        { id: 1, title: 'Quantum UI Kit', category: 'Apps', price: '$49.00', status: 'Approved' },
        { id: 2, title: 'Mastering React Forge', category: 'Courses', price: '$129.00', status: 'Pending' },
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mock submission
        setTimeout(() => {
            const formData = new FormData(e.target);
            const newProduct = {
                id: Date.now(),
                title: formData.get('title'),
                category: formData.get('category'),
                price: `$${formData.get('price')}`,
                status: 'Pending'
            };

            setUserProducts([newProduct, ...userProducts]);
            setIsSubmitting(false);
            setShowUpload(false);
            toast.success('Product uploaded for review.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(245,158,11,0.2)' }
            });
        }, 1500);
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
                            layout
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {userProducts.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                    <div className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center text-text-muted mb-6 border border-glass-border">
                        <Package size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No assets found</h3>
                    <p className="max-w-xs text-sm text-text-muted font-bold">Your digital forge is currently cold. Upload your first product to start.</p>
                </div>
            )}

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
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl glass-premium border border-glass-border rounded-[40px] shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-glass-border flex items-center justify-between">
                                <h2 className="text-2xl font-display font-black text-text-primary tracking-tight">Deploy New <span className="text-primary italic">Asset</span></h2>
                                <button
                                    onClick={() => setShowUpload(false)}
                                    className="p-2 glass rounded-full border border-glass-border hover:bg-white/5 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-text-muted ml-1">Asset Title</label>
                                        <input required name="title" className="w-full px-5 py-3.5 glass border-glass-border rounded-xl focus:outline-none focus:border-primary transition-all bg-white/5 font-bold" placeholder="e.g. Modern SaaS Template" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-text-muted ml-1">Category</label>
                                        <select required name="category" className="w-full px-5 py-3.5 glass border-glass-border rounded-xl focus:outline-none focus:border-primary transition-all bg-white/5 font-bold appearance-none">
                                            {Categories.map(cat => <option key={cat} value={cat} className="bg-bg-main">{cat}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-text-muted ml-1">Description</label>
                                    <textarea required name="description" className="w-full px-5 py-3.5 glass border-glass-border rounded-xl focus:outline-none focus:border-primary transition-all bg-white/5 font-bold min-h-[100px]" placeholder="Explain your asset and its value..." />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-text-muted ml-1">Price (USD)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                                            <input required name="price" type="number" step="0.01" className="w-full pl-10 pr-5 py-3.5 glass border-glass-border rounded-xl focus:outline-none focus:border-primary transition-all bg-white/5 font-bold" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-text-muted ml-1">Asset Preview</label>
                                        <div className="relative group/upload h-[48.5px]">
                                            <input type="file" className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
                                            <div className="absolute inset-0 flex items-center justify-center gap-2 px-5 py-3 glass border-dashed border-primary/30 rounded-xl group-hover/upload:border-primary transition-all bg-primary/5">
                                                <Upload size={16} className="text-primary" />
                                                <span className="text-xs font-black text-primary uppercase">Select Image</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
                                    <Clock className="text-amber-500 shrink-0" size={20} />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-amber-500 uppercase tracking-widest leading-none">Review Protocol</p>
                                        <p className="text-[10px] text-text-muted font-bold leading-relaxed">
                                            All assets undergo a mandatory security and quality audit. Expect approval within 12-24 cycles.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(false)}
                                        className="flex-1 py-4 glass border-glass-border rounded-2xl font-black uppercase tracking-widest text-[10px] text-text-muted hover:bg-white/5 transition-all"
                                        disabled={isSubmitting}
                                    >
                                        Retract
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 group"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Cpu className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                Initialize Deletion
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Products;
