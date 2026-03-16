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
                    className="relative w-full max-w-5xl h-[85vh] glass bg-surface-1 border border-glass-border rounded-3xl flex flex-col shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <header className="p-6 border-b border-glass-border flex items-center justify-between bg-surface-1">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-primary leading-tight">{chapterTitle || 'Chapter Preview'}</h2>
                                <p className="text-xs text-text-muted truncate max-w-md">{topic}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 border border-glass-border hover:bg-surface-1 transition-all text-sm font-bold text-text-primary">
                                <FileText size={18} />
                                Copy Text
                            </button>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-12 custom-scrollbar bg-bg-main/50">
                        <div className="max-w-3xl mx-auto bg-surface-1 p-8 sm:p-20 shadow-2xl rounded-sm min-h-full border border-glass-border">
                            <div className="prose prose-sm sm:prose-base max-w-none text-text-primary font-serif">
                                <h1 className="text-3xl font-bold mb-8 text-text-primary border-b-2 border-text-primary pb-4 uppercase tracking-tight">{chapterTitle}</h1>
                                <div className="whitespace-pre-wrap leading-relaxed text-justify">
                                    {content || "No content generated yet. Please approve a chapter plan to start drafting."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="p-4 border-t border-glass-border bg-surface-1 text-center">
                        <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.3em]">
                            Academic Preview Mode · APA Formatting applied
                        </p>
                    </footer>
                </motion.div>

            </div>
        </AnimatePresence>
    );
};

export default PreviewModal;
