import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    X,
    Cpu,
    Trash2,
    ExternalLink,
    Link2,
    ChevronDown,
    ShieldCheck,
    Zap,
    AlertTriangle,
    Edit2,
    Plus,
    Upload,
    Search,
    Filter,
    Package,
    Presentation,
    User
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
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${product.status === 'Approved' ? 'bg-emerald-500/10' : 'bg-primary/10'}`} />

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
                            <Presentation size={32} className="text-text-muted opacity-20" />
                        </div>
                    )}
                </div>
            </div>

            <div className="px-1 flex flex-col flex-grow gap-5">
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
                                Owner: {product.userName || 'Root'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Status</span>
                        <div className={`w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${activeStyle}`}>
                            {product.status === 'Approved' ? <CheckCircle2 size={10} /> : product.status === 'Declined' ? <X size={10} /> : <Clock size={10} />}
                            {product.status}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5 border-l border-white/5 pl-3">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Price</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-bold text-primary">K</span>
                            <span className="text-base font-black text-text-primary tabular-nums">
                                {product.price?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

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

                <div className="flex items-center justify-between gap-2 mt-auto">
                    {isOwner ? (
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-2 bg-primary/10 rounded-xl border border-primary/20">
                                <span className="text-[9px] font-black text-primary uppercase tracking-tighter">My Asset</span>
                            </div>
                        </div>
                    ) : <div />}

                    <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-white/5 shadow-inner">
                        {product.externalLink && (
                            <a href={product.externalLink} target="_blank" rel="noreferrer" className="p-2 hover:bg-surface-3 text-text-muted hover:text-primary transition-all rounded-lg">
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

const Yazam = () => {
    const { user } = useAuth();
    const [showUpload, setShowUpload] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userProducts, setUserProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [deckFile, setDeckFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fileMetadata, setFileMetadata] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [productToDecline, setProductToDecline] = useState(null);

    // Upload Progress States
    const [uploadStatus, setUploadStatus] = useState('');
    const [coverProgress, setCoverProgress] = useState(0);
    const [deckProgress, setDeckProgress] = useState(0);

    const uploadFileWithProgress = (file, url, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    onProgress(percent);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.error) reject(new Error(response.error));
                        else resolve(response);
                    } catch (e) {
                        reject(new Error('Invalid server response'));
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => reject(new Error('Network error')));
            xhr.open('POST', url);
            xhr.send(formData);
        });
    };

    useEffect(() => {
        const isAdmin = user.role === 'admin';
        // Only fetch products with category 'Presentations'
        const q = isAdmin
            ? query(collection(db, 'products'), where('category', '==', 'Presentations'), orderBy('createdAt', 'desc'))
            : query(
                collection(db, 'products'),
                where('category', '==', 'Presentations'),
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
            console.error("Error fetching presentations:", error);
            toast.error("Failed to load presentations");
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

    const handleDeckFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const extension = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'pptx'].includes(extension)) {
            toast.error('Only PDF or PPTX files are supported.');
            return;
        }

        setIsAnalyzing(true);
        setDeckFile(file);
        setFileMetadata({ type: extension.toUpperCase(), pages: '...' });

        try {
            const timeout = setTimeout(() => {
                if (isAnalyzing) {
                    setIsAnalyzing(false);
                    setFileMetadata(prev => ({ ...prev, pages: '?' }));
                    toast.error('File analysis timed out. You can still upload.');
                }
            }, 10000);

            if (extension === 'pdf') {
                const reader = new FileReader();
                reader.onerror = () => {
                    clearTimeout(timeout);
                    setIsAnalyzing(false);
                    toast.error('Failed to read PDF file.');
                };
                reader.onload = function () {
                    clearTimeout(timeout);
                    const content = reader.result;
                    const countMatch = content.match(/\/Count\s+(\d+)/);
                    if (countMatch && countMatch[1]) {
                        setFileMetadata(prev => ({ ...prev, pages: parseInt(countMatch[1]) }));
                    } else {
                        const pageMatches = content.match(/\/Type\s*\/Page\b/g);
                        setFileMetadata(prev => ({ ...prev, pages: pageMatches ? pageMatches.length : '?' }));
                    }
                    setIsAnalyzing(false);
                };
                reader.readAsText(file.slice(0, 500000)); // Read first 500KB for metadata
            } else if (extension === 'pptx') {
                const reader = new FileReader();
                reader.onerror = () => {
                    clearTimeout(timeout);
                    setIsAnalyzing(false);
                    toast.error('Failed to read PPTX file.');
                };
                reader.onload = function () {
                    clearTimeout(timeout);
                    const arrayBuffer = reader.result;
                    const decoder = new TextDecoder('utf-8');
                    const content = decoder.decode(new Uint8Array(arrayBuffer));
                    // PPTX slides are usually stored as ppt/slides/slideN.xml
                    // In a binary scan of a zip, we look for the filenames
                    const slideMatches = content.match(/ppt\/slides\/slide\d+\.xml/g);
                    const uniqueSlides = slideMatches ? [...new Set(slideMatches)].length : '?';
                    setFileMetadata(prev => ({ ...prev, pages: uniqueSlides }));
                    setIsAnalyzing(false);
                };
                reader.readAsArrayBuffer(file);
            }
        } catch (err) {
            console.error('File analysis error:', err);
            setIsAnalyzing(false);
            setFileMetadata(prev => ({ ...prev, pages: '?' }));
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'products', id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            toast.success(`Presentation ${newStatus.toLowerCase()}`);
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
            console.error("Error deleting presentation:", error);
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
                if (result.error) throw new Error(result.error);
                imageUrl = result.url;
            }

            const updatedData = {
                title: formData.get('title'),
                category: 'Presentations',
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
            toast.success('Presentation updated successfully');
        } catch (error) {
            console.error("Error updating presentation:", error.message || error);
            setIsSubmitting(false);
            toast.error(error.message || 'Failed to update asset');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Authentication required.');
            return;
        }
        if (!deckFile) {
            toast.error('Please upload a presentation file (PDF/PPTX)');
            return;
        }

        setIsSubmitting(true);
        setCoverProgress(0);
        setDeckProgress(0);

        try {
            const formData = new FormData(e.target);
            let imageUrl = '';
            let fileUrl = '';

            // 1. Upload Cover Image
            if (selectedFile) {
                setUploadStatus('Uploading cover image...');
                const coverResult = await uploadFileWithProgress(
                    selectedFile,
                    'https://unimarket-mw.com/kwachadigital/api/upload.php',
                    (p) => setCoverProgress(p)
                );
                imageUrl = coverResult.url;
            } else {
                setCoverProgress(100);
            }

            // 2. Upload Deck Source File
            setUploadStatus('Uploading presentation deck...');
            const deckResult = await uploadFileWithProgress(
                deckFile,
                'https://unimarket-mw.com/kwachadigital/api/upload_deck.php',
                (p) => setDeckProgress(p)
            );
            fileUrl = deckResult.url;

            setUploadStatus('Finalizing deployment...');
            const productData = {
                title: formData.get('title'),
                category: 'Presentations',
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                originalPrice: parseFloat(formData.get('originalPrice')) || 0,
                externalLink: formData.get('externalLink') || '',
                status: 'Pending',
                userId: user.uid,
                userName: user.name,
                imageUrl,
                fileUrl,
                fileType: fileMetadata?.type || deckFile.name.split('.').pop().toUpperCase(),
                pageCount: fileMetadata?.pages || '?',
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'products'), productData);

            setShowUpload(false);
            setPreviewImage(null);
            setSelectedFile(null);
            setDeckFile(null);
            setFileMetadata(null);
            toast.success('Presentation uploaded for review.');
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(error.message || 'An unexpected error occurred during upload.');
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
            setCoverProgress(0);
            setDeckProgress(0);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2">
                        Yazam <span className="text-primary italic">Portfolio</span>
                    </h1>
                    <p className="text-text-muted font-bold flex items-center gap-2">
                        <Presentation size={16} className="text-primary" />
                        Manage and deploy your premium presentation decks.
                    </p>
                </div>

                <button
                    onClick={() => setShowUpload(true)}
                    className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] group self-start"
                >
                    <Plus size={20} />
                    <span className="font-black uppercase tracking-widest text-xs">Upload Box</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search your decks..."
                        className="w-full pl-12 pr-4 py-3.5 glass border-glass-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white/5"
                    />
                </div>
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 glass border-glass-border rounded-2xl text-sm font-bold text-text-muted hover:text-primary hover:bg-white/5 transition-all">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

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
                                type="yazam"
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <Cpu className="animate-spin text-primary mb-4" size={40} />
                    <p className="text-sm text-text-muted font-bold">Synchronizing vaults...</p>
                </div>
            ) : userProducts.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                    <div className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center text-text-muted mb-6 border border-glass-border">
                        <Presentation size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Portfolio Empty</h3>
                    <p className="max-w-xs text-sm text-text-muted font-bold">You haven't uploaded any presentations yet.</p>
                </div>
            )}

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
                            <div className="relative p-10 pb-6 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                <div className="flex items-center justify-between relative z-10">
                                    <h2 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase">
                                        Deploy <span className="text-primary">Deck</span>
                                    </h2>
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
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Presentation Title</label>
                                    <input
                                        required
                                        name="title"
                                        className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-text-primary font-bold placeholder:text-text-muted/30"
                                        placeholder="Pitch Deck - Q4 2025"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Deck Overview</label>
                                    <textarea
                                        required
                                        name="description"
                                        className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-medium min-h-[120px] resize-none"
                                        placeholder="Briefly explain the contents of this deck..."
                                    />
                                </div>

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
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Sale Link (optional)</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/50">
                                                <Link2 size={18} />
                                            </div>
                                            <input name="externalLink" type="url" className="w-full pl-14 pr-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-medium" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Cover Image */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Cover Image</label>
                                        <div className="relative h-[160px] group/upload">
                                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full opacity-0 cursor-pointer z-20" />
                                            <div className={`absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all duration-500 ${previewImage ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 group-hover/upload:border-primary/40'}`}>
                                                {previewImage ? (
                                                    <div className="relative flex flex-col items-center">
                                                        <img src={previewImage} alt="Preview" className="w-24 h-24 object-cover rounded-2xl mb-2" />
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Ready</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Upload size={24} className="text-text-muted" />
                                                        <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Upload Cover</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Source File */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Deck Source File (PDF/PPTX)</label>
                                        <div className="relative h-[160px] group/upload">
                                            <input type="file" accept=".pdf,.pptx" onChange={handleDeckFileChange} className="absolute inset-0 w-full opacity-0 cursor-pointer z-20" />
                                            <div className={`absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all duration-500 ${deckFile ? 'border-secondary bg-secondary/10' : 'border-white/10 bg-white/5 group-hover/upload:border-secondary/40'}`}>
                                                {isAnalyzing ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Cpu className="animate-spin text-secondary" size={24} />
                                                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Analyzing...</span>
                                                    </div>
                                                ) : deckFile ? (
                                                    <div className="relative flex flex-col items-center">
                                                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white mb-2 shadow-xl">
                                                            <Presentation size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-secondary uppercase tracking-wider mb-1 px-3 py-1 bg-secondary/20 rounded-lg max-w-[150px] truncate">{deckFile.name}</span>
                                                        <div className="flex gap-2">
                                                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tight">{fileMetadata?.type}</span>
                                                            <span className="text-[9px] font-bold text-secondary uppercase tracking-tight">• {fileMetadata?.pages} {fileMetadata?.type === 'PPTX' ? 'Slides' : 'Pages'}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Upload size={24} className="text-text-muted" />
                                                        <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Upload Presentation</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(false)}
                                        className="flex-1 py-5 bg-surface-2/50 hover:bg-red-500/10 border border-white/5 rounded-3xl font-black uppercase tracking-widest text-[10px] text-text-muted transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2.5] py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Cpu className="animate-spin" size={18} /> : <>Upload Deck <Zap size={16} fill="currentColor" /></>}
                                    </button>
                                </div>
                            </form>

                            {/* Progress Overlay */}
                            <AnimatePresence>
                                {isSubmitting && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-[100] bg-surface-1/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center"
                                    >
                                        <div className="w-full max-w-sm space-y-12">
                                            <div className="space-y-4">
                                                <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 relative">
                                                    <div className="absolute inset-0 border-2 border-primary/20 rounded-[32px] animate-ping" />
                                                    <Cpu className="text-primary animate-spin" size={32} />
                                                </div>
                                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">Deployment <span className="text-primary">In Progress</span></h3>
                                                <p className="text-text-muted text-sm font-bold uppercase tracking-widest">{uploadStatus}</p>
                                            </div>

                                            <div className="space-y-8">
                                                {/* Cover Progress */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                                        <span className={coverProgress === 100 ? 'text-emerald-500' : 'text-text-muted'}>
                                                            {coverProgress === 100 ? '✓ Cover Uploaded' : 'Cover Image Upload'}
                                                        </span>
                                                        <span className="text-primary">{coverProgress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${coverProgress}%` }}
                                                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Deck Progress */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                                        <span className={deckProgress === 100 ? 'text-emerald-500' : 'text-text-muted'}>
                                                            {deckProgress === 100 ? '✓ Deck Uploaded' : 'Presentation Payload'}
                                                        </span>
                                                        <span className="text-secondary">{deckProgress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${deckProgress}%` }}
                                                            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8">
                                                <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.3em] animate-pulse">Synchronizing with digital vault...</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {productToEdit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setProductToEdit(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative w-full max-w-2xl bg-surface-1/90 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl p-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase mb-8">
                                Edit <span className="text-primary">Presentation</span>
                            </h2>
                            <form onSubmit={handleUpdate} className="space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Asset Identity</label>
                                    <input required name="title" defaultValue={productToEdit.title} className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Description</label>
                                    <textarea required name="description" defaultValue={productToEdit.description} className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-medium min-h-[120px] resize-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Price (MWK)</label>
                                        <input required name="price" type="number" defaultValue={productToEdit.price} className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary font-black" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary ml-1">Link</label>
                                        <input name="externalLink" type="url" defaultValue={productToEdit.externalLink} className="w-full px-6 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-text-primary" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setProductToEdit(null)} className="flex-1 py-5 bg-surface-2/50 border border-white/5 rounded-3xl font-black uppercase tracking-widest text-[10px] text-text-muted">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Update Presentation</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {productToDelete && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setProductToDelete(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-surface-1 border border-white/10 rounded-[32px] p-8 text-center">
                            <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-black text-text-primary mb-2 uppercase">Delete Deck?</h2>
                            <p className="text-text-muted text-sm mb-8">Asset: <span className="text-text-primary font-bold">{productToDelete.title}</span></p>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Erase Forever</button>
                                <button onClick={() => setProductToDelete(null)} className="w-full py-4 bg-surface-2 border border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-text-muted">Abort</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {productToDecline && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setProductToDecline(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-surface-1 border border-white/10 rounded-[32px] p-8">
                            <h2 className="text-xl font-black text-text-primary mb-6 uppercase">Decline Asset</h2>
                            <form onSubmit={handleDeclineSubmit} className="space-y-6">
                                <textarea required name="reason" className="w-full px-5 py-4 bg-surface-2/50 border border-white/5 rounded-2xl focus:outline-none focus:border-red-500/50 transition-all text-text-primary min-h-[120px]" placeholder="Reason..." />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setProductToDecline(null)} className="flex-1 py-4 bg-surface-2 border border-white/5 rounded-2xl font-black text-[10px] text-text-muted">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black text-[10px]">Confirm Decline</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Yazam;
