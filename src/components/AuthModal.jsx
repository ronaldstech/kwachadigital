import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shake, setShake] = useState(false);

    const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
    const { isDark } = useTheme();

    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setMode(initialMode);
            setEmail('');
            setPassword('');
            setName('');
        }
    }, [isOpen, initialMode]);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSocialLogin = async () => {
        setIsSubmitting(true);
        try {
            await loginWithGoogle();
            setIsSuccess(true);
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error(error);
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error(error.message || "Failed to sign in with Google.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                await loginWithEmail(email, password);
            } else {
                if (password.length < 6) throw new Error("Password must be at least 6 characters.");
                await signupWithEmail(email, password, name);
            }
            setIsSuccess(true);
            setTimeout(onClose, 2000);
        } catch (error) {
            triggerShake();
            toast.error(error.message || `Failed to ${mode}.`, {
                style: { background: isDark ? '#18181b' : '#fff', color: isDark ? '#fff' : '#18181b', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }
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
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        y: 0,
                        x: shake ? [-4, 4, -4, 4, 0] : 0
                    }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`relative w-full max-w-md ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl`}
                >
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-10 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                                        <CheckCircle2 size={40} className="text-emerald-500" />
                                    </div>
                                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'} mb-2`}>Success!</h2>
                                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Welcome back. You're being redirected...</p>
                                </motion.div>
                            ) : (
                                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'} tracking-tight`}>
                                                {mode === 'login' ? 'Welcome back' : 'Create account'}
                                            </h2>
                                            <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>
                                                {mode === 'login' ? 'Please enter your details' : 'Join Kwacha Digital today'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className={`p-2 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'} transition-colors`}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Email Form */}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {mode === 'signup' && (
                                            <div className="space-y-1.5">
                                                <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'} ml-1`}>Full Name</label>
                                                <div className="relative">
                                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="John Doe"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-zinc-800/50 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all`}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'} ml-1`}>Email Address</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="name@company.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-zinc-800/50 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all`}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Password</label>
                                                {mode === 'login' && (
                                                    <button type="button" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                                                        Forgot password?
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className={`w-full pl-11 pr-12 py-3 ${isDark ? 'bg-zinc-800/50 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'} transition-colors`}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <>
                                                    {mode === 'login' ? 'Sign in' : 'Create account'}
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className={`w-full border-t ${isDark ? 'border-white/5' : 'border-zinc-200'}`}></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className={`px-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} bg-transparent`}>or continue with</span>
                                        </div>
                                    </div>

                                    {/* Google Login Section */}
                                    <button
                                        onClick={handleSocialLogin}
                                        disabled={isSubmitting}
                                        className={`w-full flex items-center justify-center gap-3 py-3 ${isDark ? 'bg-white hover:bg-zinc-100 text-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-900 border'} font-semibold rounded-2xl transition-all active:scale-[0.98] shadow-sm`}
                                    >
                                        <GoogleIcon />
                                        <span>Sign in with Google</span>
                                    </button>

                                    {/* Toggle Mode */}
                                    <p className={`mt-8 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-600'} text-sm`}>
                                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                                        <button
                                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                            className="text-primary font-bold hover:underline transition-all"
                                        >
                                            {mode === 'login' ? 'Sign up' : 'Log in'}
                                        </button>
                                    </p>
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
