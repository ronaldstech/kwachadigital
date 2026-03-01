import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Shield,
    Lock,
    Camera,
    Save,
    Fingerprint,
    Cpu,
    Phone,
    Gift,
    Wallet,
    ArrowRight,
    KeyRound,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase';
import RedemptionModal from '../../components/RedemptionModal';
import ReferralAwardsHistory from '../../components/ReferralAwardsHistory';

// ─── Reset Password Sub-component ────────────────────────────────────────────
const ResetPasswordSection = () => {
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleReset = async () => {
        if (!currentPass || !newPass || !confirmPass) {
            toast.error('Please fill in all password fields.');
            return;
        }
        if (newPass !== confirmPass) {
            toast.error('New passwords do not match.');
            return;
        }
        if (newPass.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPass);
            setDone(true);
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
            toast.success('Password updated successfully!', {
                icon: '🔐',
                style: { background: '#111', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
            });
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                toast.error('Current password is incorrect.');
            } else {
                toast.error('Failed to update password. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full glass border border-glass-border focus:border-primary/60 rounded-[22px] px-5 py-4 text-text-primary text-sm font-bold bg-transparent outline-none placeholder:text-text-muted/40 transition-colors pr-12";

    return (
        <div className="glass-premium rounded-[48px] border-glass-border p-10">
            <h3 className="text-xl font-display font-black text-text-primary tracking-tight mb-2 flex items-center gap-3">
                <KeyRound className="text-primary" size={22} />
                Reset Password
            </h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-8">
                Update your account password
            </p>

            <div className="space-y-4">
                {/* Current */}
                <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-2">Current Password</label>
                    <div className="relative">
                        <input
                            type={showCurrent ? 'text' : 'password'}
                            value={currentPass}
                            onChange={e => setCurrentPass(e.target.value)}
                            placeholder="Enter current password"
                            className={inputClass}
                        />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* New */}
                <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-2">New Password</label>
                    <div className="relative">
                        <input
                            type={showNew ? 'text' : 'password'}
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            placeholder="Min. 6 characters"
                            className={inputClass}
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Confirm */}
                <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted block mb-2">Confirm New Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={confirmPass}
                            onChange={e => setConfirmPass(e.target.value)}
                            placeholder="Re-enter new password"
                            className={`${inputClass} ${confirmPass && newPass && confirmPass !== newPass ? 'border-red-500/60' : confirmPass && confirmPass === newPass ? 'border-primary/60' : ''}`}
                        />
                        {confirmPass && newPass && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {confirmPass === newPass
                                    ? <CheckCircle size={16} className="text-primary" />
                                    : <span className="text-red-400 text-[10px] font-bold">✗</span>
                                }
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)] transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : <><KeyRound size={16} /> Update Password</>}
                </button>
            </div>
        </div>
    );
};

// ─── Main Settings Component ──────────────────────────────────────────────────
const Settings = ({ user }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);

    // Editable fields
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bio, setBio] = useState(user?.bio || '');

    const handleSave = async () => {
        if (!user?.uid) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name: name.trim(),
                phone: phone.trim(),
                bio: bio.trim(),
            });
            toast.success('Profile saved successfully!', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "w-full pl-14 pr-5 py-4 glass border border-glass-border rounded-[22px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 placeholder:text-text-muted/30";

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-2">
                            My <span className="text-primary italic">Profile</span>
                        </h1>
                        <p className="text-text-muted font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <Fingerprint size={14} className="text-primary" />
                            Manage your account information
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] disabled:opacity-70 group self-start"
                    >
                        {isSaving ? <Cpu className="animate-spin" size={18} /> : <Save size={18} />}
                        <span className="font-black uppercase tracking-widest text-xs">{isSaving ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <div className="glass-premium rounded-[48px] border-glass-border p-10 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-[40px] bg-primary/20 flex items-center justify-center text-5xl font-display font-black text-primary border-4 border-white/5 shadow-2xl">
                                    {user?.avatar}
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-bg-main border border-glass-border flex items-center justify-center text-text-primary hover:text-primary transition-all shadow-lg">
                                    <Camera size={18} />
                                </button>
                            </div>

                            <h3 className="text-2xl font-display font-black text-text-primary mb-1">{user?.name}</h3>
                            <p className="text-xs font-bold text-text-muted mb-6">{user?.email}</p>

                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-8">
                                <Shield size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified Member</span>
                            </div>

                            {/* Referral Rewards */}
                            <div className="w-full glass-premium bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 text-left relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                                <div className="relative z-10">
                                    <h4 className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-primary mb-4">
                                        <Gift size={14} className="animate-pulse" /> Referral Rewards
                                    </h4>
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-xs font-black text-text-primary/60">MK</span>
                                        <span className="text-3xl font-display font-black text-text-primary tracking-tighter">
                                            {(user?.points || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary font-medium mb-5">
                                        Earn 10% on all successful referrals.
                                    </p>
                                    <button
                                        onClick={() => setIsRedeemOpen(true)}
                                        className="w-full py-3 bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Wallet size={14} />
                                        Redeem for Cash
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>

                            <ReferralAwardsHistory user={user} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Identity Card */}
                        <div className="glass-premium rounded-[48px] border-glass-border p-10">
                            <h3 className="text-xl font-display font-black text-text-primary tracking-tight mb-8 flex items-center gap-3">
                                <User className="text-primary" size={22} />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Full Name */}
                                <div className="group">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black mb-2 block ml-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {/* Email (read-only) */}
                                <div className="group">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black mb-2 block ml-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            readOnly
                                            className={`${inputClass} opacity-60 cursor-not-allowed`}
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="group md:col-span-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black mb-2 block ml-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                            <Phone size={16} className="text-text-muted group-focus-within:text-primary transition-colors" />
                                            <span className="text-text-secondary font-black text-sm">+265</span>
                                            <div className="w-px h-5 bg-glass-border" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="e.g. 991 234 567"
                                            className="w-full pl-28 pr-5 py-4 glass border border-glass-border rounded-[22px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 placeholder:text-text-muted/30"
                                            maxLength={12}
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-muted font-bold mt-2 ml-1">
                                        Used for mobile money redemptions
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black mb-2 block ml-1">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    className="w-full p-5 glass border border-glass-border rounded-[22px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 min-h-[120px] resize-none placeholder:text-text-muted/30"
                                    placeholder="Tell others about yourself..."
                                />
                            </div>
                        </div>

                        {/* Reset Password */}
                        <ResetPasswordSection />
                    </div>
                </div>
            </motion.div>

            <RedemptionModal
                isOpen={isRedeemOpen}
                onClose={() => setIsRedeemOpen(false)}
                user={user}
            />
        </>
    );
};

export default Settings;
