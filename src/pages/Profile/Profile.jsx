import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    LogOut,
    Zap,
    LayoutDashboard,
    Settings as SettingsIcon,
    ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// We'll reuse the Settings component from the Dashboard since it's now modular
import SettingsPage from '../Dashboard/Settings';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-main">
            {/* Simple Top Header for Profile Page (when accessed directly) */}
            <div className="h-20 glass-premium border-b border-glass-border px-6 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-bold text-sm"
                >
                    <ChevronLeft size={20} />
                    Return
                </button>
                <Link to="/" className="flex items-center gap-2 no-underline">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                        <Zap size={16} />
                    </div>
                    <span className="font-display font-bold text-lg text-text-primary tracking-tight">Arcade<span className="text-primary">.</span>HQ</span>
                </Link>
                <Link to="/dashboard" className="p-2 glass rounded-xl border border-glass-border text-text-primary hover:text-primary transition-all">
                    <LayoutDashboard size={20} />
                </Link>
            </div>

            <main className="p-6 lg:p-12 max-w-[1280px] mx-auto">
                <SettingsPage user={user} />
            </main>
        </div>
    );
};

export default Profile;
