import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import { Loader2, Sparkles, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const FreeProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFreeProducts = async () => {
            try {
                const q = query(
                    collection(db, 'products'),
                    where('status', '==', 'Approved'),
                    where('price', '==', 0),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const fetchedProducts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching free products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFreeProducts();
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-24 bg-bg-main">
            <div className="container px-4 md:px-10">
                {/* Header Section */}
                <div className="mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs mb-4"
                    >
                        <Sparkles size={16} />
                        <span>Community Assets</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-display font-black text-text-primary tracking-tight"
                    >
                        Free Products
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-text-secondary mt-6 max-w-2xl text-lg font-medium opacity-60"
                    >
                        Explore our collection of high-quality digital assets available for free. Empowering the Malawian creative ecosystem through open resources.
                    </motion.p>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center py-32">
                        <Loader2 className="animate-spin text-primary w-10 h-10" />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ProductCard item={product} type="product" />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[40px]">
                        <Package size={48} className="text-text-muted mx-auto mb-6 opacity-20" />
                        <h3 className="text-xl font-bold text-text-primary mb-2">No free products yet</h3>
                        <p className="text-text-secondary opacity-60">Check back later for new community assets.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreeProducts;
