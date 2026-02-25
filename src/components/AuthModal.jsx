import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, Rocket, CheckCircle2, ShieldCheck, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const StaggeredChildren = ({ children, delay = 0 }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1,
                    delayChildren: delay
                }
            }
        }}
    >
        {children}
    </motion.div>
);

const FadeInItem = ({ children }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 15, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 }
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
        {children}
    </motion.div>
);

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shake, setShake] = useState(false);

    const { loginWithEmail, signupWithEmail } = useAuth();

    // Reset success state on open
    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);

    const getPasswordStrength = () => {
        if (!password) return 0;
        let strength = 0;
        if (password.length > 6) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                await loginWithEmail(email, password);
            } else {
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters.");
                }
                await signupWithEmail(email, password, name);
            }

            // Success Flow
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1800);

        } catch (error) {
            console.error(error);
            triggerShake();
            toast.error(error.message || `Failed to ${mode}. Please retry.`, {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,50,50,0.2)' }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        x: shake ? [-5, 5, -5, 5, 0] : 0
                    }}
                    exit={{ scale: 0.9, opacity: 0, y: 40 }}
                    transition={{
                        type: 'spring',
                        damping: 20,
                        stiffness: 150,
                        x: { duration: 0.4 }
                    }}
                    className="relative w-full max-w-[460px] glass-premium rounded-[48px] border-glass-border overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] bg-bg-main/70 backdrop-blur-[40px]"
                >
                    {/* Glass Shimmer Effect */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] pointer-events-none -z-10"
                    />

                    {/* Background Decorative Elements */}
                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
                    <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-secondary/15 rounded-full blur-[100px] -z-10" />

                    <div className="relative p-8 md:p-12">
                        {/* Status Check Switch */}
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success-screen"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-12"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: [0, 15, 0] }}
                                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                        className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 border border-primary/30"
                                    >
                                        <CheckCircle2 size={48} className="text-primary" />
                                    </motion.div>
                                    <h2 className="text-3xl font-display font-black text-text-primary mb-3">Identity Verified</h2>
                                    <p className="text-text-muted font-bold text-center max-w-[200px]">
                                        Mapping neural connection... Welcome to the Arcade.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div key="form-container">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] relative group">
                                                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Rocket size={22} className="text-white transform group-hover:rotate-12 transition-transform" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-display font-black text-text-primary tracking-tight leading-none mb-1">
                                                    {mode === 'login' ? 'Sign In' : 'Sign Up'}
                                                </h2>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="w-11 h-11 rounded-2xl glass border-glass-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all group active:scale-90"
                                        >
                                            <X size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                                        </button>
                                    </div>

                                    <StaggeredChildren>
                                        {/* Social Integration */}
                                        <FadeInItem>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <button className="relative group overflow-hidden flex items-center justify-center gap-3 py-4 glass border-glass-border rounded-2xl transition-all active:scale-95">
                                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <Chrome size={18} className="text-text-primary group-hover:text-blue-400 transition-colors" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-text-primary">Google</span>
                                                </button>
                                                <button className="relative group overflow-hidden flex items-center justify-center gap-3 py-4 glass border-glass-border rounded-2xl transition-all active:scale-95">
                                                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <Github size={18} className="text-text-primary group-hover:text-purple-400 transition-colors" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-text-primary">Github</span>
                                                </button>
                                            </div>
                                        </FadeInItem>

                                        <FadeInItem>
                                            <div className="relative mb-4">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-glass-border"></div>
                                                </div>
                                                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
                                                    <span className="px-4 text-text-muted">or Continue with Email</span>
                                                </div>
                                            </div>
                                        </FadeInItem>

                                        <FadeInItem>
                                            <form onSubmit={handleSubmit} className="space-y-2">
                                                {mode === 'signup' && (
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none">
                                                            <User size={18} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Full Name"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className="w-full pl-14 pr-5 py-4.5 glass border-glass-border rounded-[20px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 placeholder:text-text-muted/50"
                                                        />
                                                    </div>
                                                )}

                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none">
                                                        <Mail size={18} />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="Email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full pl-14 pr-5 py-4.5 glass border-glass-border rounded-[20px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 placeholder:text-text-muted/50"
                                                    />
                                                </div>

                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none">
                                                        <Lock size={18} />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        required
                                                        placeholder="Password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full pl-14 pr-5 py-4.5 glass border-glass-border rounded-[20px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 placeholder:text-text-muted/50"
                                                    />

                                                    {/* Password Strength Widget */}
                                                    {mode === 'signup' && password.length > 0 && (
                                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1">
                                                            {[1, 2, 3, 4].map((step) => (
                                                                <motion.div
                                                                    key={step}
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className={`w-1.5 h-1.5 rounded-full ${step <= getPasswordStrength() ? 'bg-primary' : 'bg-white/10'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {mode === 'login' && (
                                                    <div className="flex justify-end px-2">
                                                        <button type="button" className="text-[10px] tracking-widest font-black text-red-500 hover:text-red-600 transition-colors">
                                                            Forgot Password?
                                                        </button>
                                                    </div>
                                                )}

                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full relative group h-[50px] mt-2 rounded-[22px] overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-primary opacity-100 group-hover:bg-primary-dark transition-colors duration-300" />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                                                    <span className="relative z-10 flex items-center justify-center gap-3 text-white text-xs font-black uppercase tracking-[0.2em]">
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 size={18} className="animate-spin" />
                                                                <span>{mode === 'login' ? 'Logging In...' : 'Creating Account...'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>{mode === 'login' ? 'SignIn' : 'SignUp'}</span>
                                                                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                                                            </>
                                                        )}
                                                    </span>
                                                </motion.button>
                                            </form>
                                        </FadeInItem>

                                        <FadeInItem>
                                            <div className="mt-5 pt-8 border-t border-glass-border flex flex-col gap-6">
                                                <p className="text-center text-xs font-bold text-text-secondary">
                                                    {mode === 'login' ? "First time around here?" : "Already have an account?"}
                                                    <button
                                                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                                        className="ml-2 text-primary hover:text-primary-dark font-black uppercase tracking-widest transition-colors"
                                                    >
                                                        {mode === 'login' ? 'Create Account' : 'Sign In'}
                                                    </button>
                                                </p>
                                            </div>
                                        </FadeInItem>
                                    </StaggeredChildren>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
