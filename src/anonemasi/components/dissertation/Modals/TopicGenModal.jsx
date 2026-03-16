import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin, GraduationCap, Lightbulb } from 'lucide-react';

const TopicGenModal = ({ isOpen, onClose, onGenerate }) => {
    const [program, setProgram] = useState('');
    const [region, setRegion] = useState('');
    const [interest, setInterest] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (program && region) {
            onGenerate(program, region, interest);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg glass bg-surface-1 border border-glass-border rounded-3xl p-8 shadow-2xl overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Sparkles size={20} />
                            </div>
                            <h2 className="text-2xl font-bold font-outfit text-text-primary">Generate Topics</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                                <GraduationCap size={14} />
                                Your Program / Course
                            </label>
                            <input
                                required
                                type="text"
                                value={program}
                                onChange={(e) => setProgram(e.target.value)}
                                placeholder="e.g. Health Information Management, Business Admin..."
                                className="w-full bg-surface-2 border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-indigo-500/50 focus:ring-0 transition-all placeholder:text-text-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                                <MapPin size={14} />
                                Region / Focus Area
                            </label>
                            <input
                                required
                                type="text"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                placeholder="e.g. Malawi, Southern Africa, Rural Areas..."
                                className="w-full bg-surface-2 border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-indigo-500/50 focus:ring-0 transition-all placeholder:text-text-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                                <Lightbulb size={14} />
                                Specific Interest (Optional)
                            </label>
                            <input
                                type="text"
                                value={interest}
                                onChange={(e) => setInterest(e.target.value)}
                                placeholder="e.g. EHR systems, Data Security, Sustainability..."
                                className="w-full bg-surface-2 border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-indigo-500/50 focus:ring-0 transition-all placeholder:text-text-muted/50"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 mt-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Sparkles size={18} />
                            Generate Dissertation Topics
                        </button>
                    </form>
                </motion.div>

            </div>
        </AnimatePresence>
    );
};

export default TopicGenModal;
