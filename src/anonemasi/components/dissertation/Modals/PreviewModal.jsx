import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, BookOpen } from 'lucide-react';

const PreviewModal = ({ isOpen, onClose, topic, chapterTitle, content }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="relative w-full max-w-5xl h-[85vh] glass-panel bg-[#141416] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <header className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">{chapterTitle || 'Chapter Preview'}</h2>
                                <p className="text-xs text-white/40 truncate max-w-md">{topic}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-white">
                                <FileText size={18} />
                                Copy Text
                            </button>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar bg-[#0A0A0B]/50">
                        <div className="max-w-3xl mx-auto bg-white p-12 sm:p-20 shadow-2xl rounded-sm min-h-full">
                            <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 font-serif">
                                <h1 className="text-3xl font-bold mb-8 text-black border-b-2 border-black pb-4 uppercase tracking-tight">{chapterTitle}</h1>
                                <div className="whitespace-pre-wrap leading-relaxed text-justify">
                                    {content || "No content generated yet. Please approve a chapter plan to start drafting."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="p-4 border-t border-white/10 bg-white/5 text-center">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                            Academic Preview Mode · APA Formatting applied
                        </p>
                    </footer>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PreviewModal;
