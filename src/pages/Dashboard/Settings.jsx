import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Shield,
    Bell,
    Lock,
    Camera,
    Save,
    Fingerprint,
    Cpu,
    Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfileField = ({ label, value, icon: Icon, type = "text", placeholder }) => (
    <div className="group">
        <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black mb-2 block ml-1">{label}</label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                <Icon size={18} />
            </div>
            <input
                type={type}
                defaultValue={value}
                placeholder={placeholder}
                className="w-full pl-14 pr-5 py-4 glass border-glass-border rounded-[22px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 placeholder:text-text-muted/30"
            />
        </div>
    </div>
);

const SecurityToggle = ({ label, description, icon: Icon, enabledByDefault = false }) => {
    const [enabled, setEnabled] = useState(enabledByDefault);
    return (
        <div className="flex items-center justify-between p-5 glass rounded-[24px] border border-glass-border hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${enabled ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-text-muted'}`}>
                    <Icon size={22} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-text-primary leading-none mb-1">{label}</h4>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{description}</p>
                </div>
            </div>
            <button
                onClick={() => setEnabled(!enabled)}
                className={`w-14 h-8 rounded-full transition-all relative p-1 ${enabled ? 'bg-primary' : 'bg-surface-2'}`}
            >
                <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );
};

const Settings = ({ user }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Founder profile synchronized.', {
                style: { background: '#111', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
            });
        }, 1200);
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
                        System <span className="text-primary italic">Protocol</span>
                    </h1>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Fingerprint size={14} className="text-primary" />
                        Configure your secure arcade identity
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] disabled:opacity-70 group self-start"
                >
                    {isSaving ? <Cpu className="animate-spin" size={18} /> : <Save size={18} />}
                    <span className="font-black uppercase tracking-widest text-xs">{isSaving ? 'Syncing...' : 'Save Settings'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Left Column - Avatar & Core Info */}
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified Founder</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="p-4 glass rounded-2xl border border-glass-border">
                                <p className="text-[10px] uppercase font-black text-text-muted mb-1">Rank</p>
                                <p className="text-sm font-black text-text-primary">Master</p>
                            </div>
                            <div className="p-4 glass rounded-2xl border border-glass-border">
                                <p className="text-[10px] uppercase font-black text-text-muted mb-1">XP</p>
                                <p className="text-sm font-black text-text-primary">2.4k</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-premium rounded-[40px] border-glass-border p-8">
                        <h4 className="text-sm font-black text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Bell size={16} className="text-primary" />
                            Relay Logs
                        </h4>
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-2xl p-4 border border-glass-border">
                                <p className="text-[10px] text-text-muted font-bold mb-1">Feb 25, 03:00</p>
                                <p className="text-xs font-bold text-text-primary">Settings synchronized</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-glass-border opacity-50">
                                <p className="text-[10px] text-text-muted font-bold mb-1">Feb 24, 18:42</p>
                                <p className="text-xs font-bold text-text-primary">Credentials updated</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Forms & Security */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-premium rounded-[48px] border-glass-border p-10">
                        <h3 className="text-xl font-display font-black text-text-primary tracking-tight mb-8 flex items-center gap-3">
                            <User className="text-primary" size={22} />
                            Identity Matrix
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <ProfileField label="Full Name" value={user?.name} icon={User} />
                            <ProfileField label="Relay Email" value={user?.email} icon={Mail} />
                            <ProfileField label="Alias / Handle" value={user?.name?.split(' ')[0]} icon={Globe} placeholder="@username" />
                            <ProfileField label="Access Level" value="Premium Founder" icon={Shield} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black mb-2 block ml-1">Biosync / Description</label>
                            <textarea
                                className="w-full p-5 glass border-glass-border rounded-[22px] text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all bg-white/5 min-h-[120px] resize-none"
                                placeholder="Tell us about your digital forge..."
                            />
                        </div>
                    </div>

                    <div className="glass-premium rounded-[48px] border-glass-border p-10">
                        <h3 className="text-xl font-display font-black text-text-primary tracking-tight mb-8 flex items-center gap-3">
                            <Lock className="text-primary" size={22} />
                            Security Layers
                        </h3>
                        <div className="space-y-4">
                            <SecurityToggle
                                label="Duo-Factor Verification"
                                description="Secure account with mobile handshake"
                                icon={Shield}
                                enabledByDefault={true}
                            />
                            <SecurityToggle
                                label="Biometric Entry"
                                description="Link physical identity to arcade access"
                                icon={Fingerprint}
                            />
                            <SecurityToggle
                                label="Session Relay"
                                description="Receive alerts for new access points"
                                icon={Bell}
                                enabledByDefault={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
