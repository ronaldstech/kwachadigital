import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot as onSnapshotDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../firebase';
import { toast } from 'react-hot-toast';

import SystemLoader from '../components/SystemLoader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isBuyTokensModalOpen, setIsBuyTokensModalOpen] = useState(false);
    const [initialAuthMode, setInitialAuthMode] = useState('login');

    const isInitialAuthCheck = useRef(true);

    useEffect(() => {
        let unsubscribeDoc = null;
        console.info('[AuthContext] Initializing onAuthStateChanged...');

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            console.info(`[AuthContext] onAuthStateChanged fired. User: ${firebaseUser ? 'Found' : 'null'} (Initial: ${isInitialAuthCheck.current})`);
            
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                
                unsubscribeDoc = onSnapshotDoc(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userData,
                            tokens: userData.tokens || 0,
                            avatar: userData.avatar || (userData.name || firebaseUser.email).slice(0, 2).toUpperCase()
                        });

                    } else {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            avatar: 'KD'
                        });
                    }
                    setLoading(false);
                    isInitialAuthCheck.current = false;
                }, (error) => {
                    console.error("[AuthContext] Firestore error:", error);
                    setLoading(false);
                    isInitialAuthCheck.current = false;
                });
            } else {
                if (isInitialAuthCheck.current) {
                    console.info('[AuthContext] Initial guest check. Applying 300ms safety delay for persistence layer...');
                    setTimeout(() => {
                        if (isInitialAuthCheck.current) {
                            console.info('[AuthContext] No session restored. Setting guest state.');
                            setUser(null);
                            setLoading(false);
                            isInitialAuthCheck.current = false;
                        }
                    }, 300);
                } else {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            console.info('[AuthContext] Cleaning up AuthProvider');
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);


    const loginWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Access Granted. Welcome to the Arcade.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
        } catch (error) {
            throw error;
        }
    };

    const signupWithEmail = async (email, password, name) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Auth Profile
            await updateProfile(user, { displayName: name });

            // Create Firestore Document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: 'user', // Default role
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                avatar: name.slice(0, 2).toUpperCase()
            });

            setUser(prev => ({ ...prev, name }));
            toast.success('Founder ID Created. Welcome to Kwacha Digital.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
        } catch (error) {
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create Firestore Document for new Google user
                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    role: 'user',
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    avatar: (user.displayName || user.email).slice(0, 2).toUpperCase(),
                    bio: ''
                });
            } else {
                // Update last login
                await setDoc(userDocRef, {
                    lastLogin: serverTimestamp()
                }, { merge: true });
            }

            toast.success('Access Granted. Profile synchronized.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
        } catch (error) {
            console.error("Google Auth Error:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error('Google authentication failed.');
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success('Session terminated securelly.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const openAuthModal = (mode = 'login') => {
        setInitialAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => setIsAuthModalOpen(false);

    const openBuyTokensModal = () => {
        if (!user) {
            openAuthModal('login');
            return;
        }
        setIsBuyTokensModalOpen(true);
    };

    const closeBuyTokensModal = () => setIsBuyTokensModalOpen(false);


    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithEmail,
            signupWithEmail,
            loginWithGoogle,
            logout,
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal,
            initialAuthMode,
            isBuyTokensModalOpen,
            openBuyTokensModal,
            closeBuyTokensModal
        }}>

            {loading ? <SystemLoader /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
