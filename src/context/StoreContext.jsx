import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const StoreContext = createContext();

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

export const StoreProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [referrerId, setReferrerId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial load from localStorage for guests & Referral capturing
    useEffect(() => {
        // Capture referral ID from URL
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setReferrerId(ref);
            sessionStorage.setItem('kd_referrer', ref);
        } else {
            const savedRef = sessionStorage.getItem('kd_referrer');
            if (savedRef) setReferrerId(savedRef);
        }

        if (!user) {
            const localCart = JSON.parse(localStorage.getItem('kd_cart') || '[]');
            const localFavs = JSON.parse(localStorage.getItem('kd_favorites') || '[]');
            setCart(localCart);
            setFavorites(localFavs);
            setLoading(false);
        }
    }, [user]);

    // Sync with Firestore for logged-in users
    useEffect(() => {
        if (!user?.uid) return;

        setLoading(true);

        // Cart listener
        const cartRef = collection(db, 'users', user.uid, 'cart');
        const unsubCart = onSnapshot(cartRef, (snap) => {
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCart(items);
        });

        // Favorites listener
        const favRef = collection(db, 'users', user.uid, 'favorites');
        const unsubFav = onSnapshot(favRef, (snap) => {
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFavorites(items);
            setLoading(false);
        });

        return () => {
            unsubCart();
            unsubFav();
        };
    }, [user?.uid]);

    // Perspectives persistence for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem('kd_cart', JSON.stringify(cart));
            localStorage.setItem('kd_favorites', JSON.stringify(favorites));
        }
    }, [cart, favorites, user]);

    const addToCart = async (product) => {
        const item = {
            productId: product.id,
            sellerId: product.userId,
            title: product.title || product.name,
            price: product.price,
            imageUrl: product.imageUrl || product.image || null,
            category: product.category || null,
            addedAt: new Date().toISOString()
        };

        if (user) {
            try {
                const cartDocRef = doc(db, 'users', user.uid, 'cart', product.id);
                await setDoc(cartDocRef, {
                    ...item,
                    addedAt: serverTimestamp()
                });
                toast.success('Added to cart! 🛒');
            } catch (err) {
                console.error('Cart error:', err);
                toast.error('Failed to add to cart.');
            }
        } else {
            setCart(prev => {
                const exists = prev.find(i => i.productId === product.id);
                if (exists) return prev;
                return [...prev, item];
            });
            toast.success('Added to cart! (Guest) 🛒');
        }
    };

    const removeFromCart = async (productId) => {
        if (user) {
            try {
                const cartDocRef = doc(db, 'users', user.uid, 'cart', productId);
                await deleteDoc(cartDocRef);
                toast.success('Removed from cart.');
            } catch (err) {
                console.error('Cart error:', err);
                toast.error('Failed to remove from cart.');
            }
        } else {
            setCart(prev => prev.filter(i => i.productId !== productId));
            toast.success('Removed from cart.');
        }
    };

    const toggleFavorite = async (product) => {
        const productId = product.id;
        const exists = favorites.find(i => i.productId === productId);

        if (user) {
            try {
                const favDocRef = doc(db, 'users', user.uid, 'favorites', productId);
                if (exists) {
                    await deleteDoc(favDocRef);
                    toast.success('Removed from favorites.');
                } else {
                    await setDoc(favDocRef, {
                        productId: productId,
                        title: product.title || product.name,
                        price: product.price,
                        imageUrl: product.imageUrl || product.image || null,
                        category: product.category || null,
                        savedAt: serverTimestamp()
                    });
                    toast.success('Added to favorites! ❤️');
                }
            } catch (err) {
                console.error('Favorites error:', err);
                toast.error('Failed to update favorites.');
            }
        } else {
            if (exists) {
                setFavorites(prev => prev.filter(i => i.productId !== productId));
                toast.success('Removed from favorites.');
            } else {
                const newItem = {
                    productId: productId,
                    title: product.title || product.name,
                    price: product.price,
                    imageUrl: product.imageUrl || product.image || null,
                    category: product.category || null,
                    savedAt: new Date().toISOString()
                };
                setFavorites(prev => [...prev, newItem]);
                toast.success('Added to favorites! (Guest) ❤️');
            }
        }
    };

    const value = {
        cart,
        favorites,
        referrerId,
        loading,
        addToCart,
        removeFromCart,
        toggleFavorite,
        isInCart: (id) => cart.some(i => i.productId === id),
        isInFavorites: (id) => favorites.some(i => i.productId === id)
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};
