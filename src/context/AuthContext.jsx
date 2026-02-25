import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot as onSnapshotDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../firebase';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [initialAuthMode, setInitialAuthMode] = useState('login');

    useEffect(() => {
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (firebaseUser) {
                // Fetch user data from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);

                // Set up a real-time listener for the user document
                unsubscribeDoc = onSnapshotDoc(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            role: userData.role,
                            ...userData,
                            avatar: userData.avatar || (userData.name || firebaseUser.email).slice(0, 2).toUpperCase()
                        });
                    } else {
                        // Fallback if doc doesn't exist yet (e.g., during signup)
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            role: 'user',
                            avatar: 'KD'
                        });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user doc:", error);
                    setLoading(false);
                });
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
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

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithEmail,
            signupWithEmail,
            logout,
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal,
            initialAuthMode
        }}>
            {!loading && children}
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
