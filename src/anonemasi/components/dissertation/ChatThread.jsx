import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Book, CheckCircle2, List, ChevronRight, Paperclip, Trophy, ArrowRight, Download, Zap } from 'lucide-react';

const ACTIONABLE_TYPES = ['plan', 'citations', 'chapter_complete', 'dissertation_complete', 'upgrade_required'];

const ChatThread = ({
    messages,
    loading,
    onSelectTopic,
    onApprovePlan,
    onStartTopicGen,
    draftChapter,
    onStartChapter,
    onExportWord,
    onExportPDF,
    onUpgradeClick
}) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const pendingAction = !loading
        ? [...messages].reverse().find(m => ACTIONABLE_TYPES.includes(m.type))
        : null;

    const renderActionBar = () => {
        if (!pendingAction) return null;

        const baseBar = "flex flex-col xs:flex-row items-center justify-between gap-3 px-4 py-3 xs:py-2.5 bg-white dark:bg-[#0e0e10] border-t border-zinc-200 dark:border-white/10";

        if (pendingAction.type === 'plan') {
            return (
                <motion.div key="plan-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                            <List size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[var(--text-primary)]">Chapter {pendingAction.chapterNum} Plan Ready</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">Review the outline above, then approve to continue.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onApprovePlan(pendingAction.chapterNum)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/15 border border-green-500/25 text-green-700 dark:text-green-400 hover:bg-green-500/25 transition-all text-xs font-bold shrink-0"
                    >
                        <CheckCircle2 size={13} />
                        Approve Plan
                    </button>
                </motion.div>
            );
        }

        if (pendingAction.type === 'citations') {
            return (
                <motion.div key="citations-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Book size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[var(--text-primary)]">Citations Ready — Chapter {pendingAction.chapterNum}</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">Sources found. Start drafting the full chapter.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => draftChapter(pendingAction.chapterNum)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-500/20 shrink-0"
                    >
                        <Sparkles size={13} />
                        Proceed to Drafting
                    </button>
                </motion.div>
            );
        }

        if (pendingAction.type === 'chapter_complete') {
            return (
                <motion.div key="chapter-complete-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                            <CheckCircle2 size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[var(--text-primary)]">Chapter {pendingAction.chapterNum} Complete!</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">Ready to begin Chapter {pendingAction.nextChapter}.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onStartChapter(pendingAction.nextChapter)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-500/20 shrink-0"
                    >
                        Start Chapter {pendingAction.nextChapter}
                        <ArrowRight size={13} />
                    </button>
                </motion.div>
            );
        }

        if (pendingAction.type === 'upgrade_required') {
            return (
                <motion.div key="upgrade-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Zap size={13} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[var(--text-primary)]">Upgrade Required</p>
                            <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1">{pendingAction.content}</p>
                        </div>
                    </div>
                    <button
                        onClick={onUpgradeClick}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all text-xs font-black shadow-lg shadow-indigo-500/20 shrink-0"
                    >
                        Unlock All Chapters
                        <Sparkles size={12} />
                    </button>
                </motion.div>
            );
        }

        if (pendingAction.type === 'dissertation_complete') {
            return (
                <motion.div key="dissertation-complete-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                            <Trophy size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[var(--text-primary)]">Dissertation Complete!</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">Your work is ready for submission.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExportWord}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-[var(--text-primary)] transition-all text-xs font-bold shrink-0 border border-zinc-200 dark:border-white/10"
                        >
                            <Download size={13} className="text-blue-500" />
                            Word
                        </button>
                        <button
                            onClick={onExportPDF}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-500/20 shrink-0"
                        >
                            <Download size={13} />
                            PDF
                        </button>
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    // Shared card classes: visible in both light and dark
    const aiCard = "bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-tl-sm";
    const innerCard = "bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/5";

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-4">
                <div className="max-w-3xl mx-auto space-y-7">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role !== 'user' && (
                                <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Sparkles size={15} />
                                </div>
                            )}

                            <div className={`flex flex-col gap-1 max-w-[88%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-60 px-1">
                                    {msg.role === 'user' ? 'You' : 'Anonemasi Writer'}
                                </span>

                                <div className={`p-4 rounded-xl border relative group text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-500/10 border-indigo-500/20 rounded-tr-sm text-indigo-800 dark:text-indigo-200'
                                    : `${aiCard} text-[var(--text-primary)]`
                                    }`}>

                                    {/* Welcome */}
                                    {msg.type === 'welcome' && (
                                        <div className="space-y-4 text-center py-3">
                                            <div>
                                                <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-1">Welcome to your writing workspace.</h2>
                                                <p className="text-xs leading-relaxed text-[var(--text-secondary)] max-w-md mx-auto">
                                                    I'll analyze your requirements, find academic sources, build a comprehensive plan, and draft each paragraph with proper citations.
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                <button
                                                    onClick={onStartTopicGen}
                                                    className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all group flex flex-col items-center gap-2 text-center"
                                                >
                                                    <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                                        <Sparkles size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-[var(--text-primary)] text-xs">Generate Topics</span>
                                                        <span className="block text-[10px] text-[var(--text-secondary)]">AI suggests relevant research topics</span>
                                                    </div>
                                                </button>
                                                <div className="p-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-all cursor-pointer group flex flex-col items-center gap-2 text-center">
                                                    <div className="p-2.5 rounded-lg bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-white/40 group-hover:text-[var(--text-primary)] transition-colors">
                                                        <Book size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-[var(--text-primary)] text-xs">Manual Entry</span>
                                                        <span className="block text-[10px] text-[var(--text-secondary)]">Have a topic? Paste it below</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Topics list */}
                                    {msg.type === 'topics' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Suggested Dissertation Topics</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {msg.topics.map((topic, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => onSelectTopic(topic)}
                                                        className={`p-3.5 rounded-xl ${innerCard} hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer group text-left`}
                                                    >
                                                        <h4 className="font-bold text-xs text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">{topic.title}</h4>
                                                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2 line-clamp-2">{topic.background}</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {topic.objectives.slice(0, 2).map((obj, oIdx) => (
                                                                <span key={oIdx} className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/15">Obj {oIdx + 1}: {obj.substring(0, 35)}…</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Chapter plan */}
                                    {msg.type === 'plan' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <List size={15} className="text-indigo-600 dark:text-indigo-400" />
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Chapter {msg.chapterNum} Plan</h3>
                                            </div>
                                            <div className="space-y-2.5">
                                                {msg.plan.map((item, idx) => (
                                                    <div key={idx} className={`p-3 rounded-xl ${innerCard}`}>
                                                        <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-2">
                                                            <span className="w-4 h-4 rounded bg-indigo-500/10 flex items-center justify-center text-[9px] font-mono text-indigo-600 dark:text-indigo-400 shrink-0">{idx + 1}</span>
                                                            {item.heading}
                                                        </h4>
                                                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2">{item.purpose}</p>
                                                        <ul className="space-y-1 border-l-2 border-indigo-500/20 pl-3">
                                                            {item.keyPoints.map((kp, kpIdx) => (
                                                                <li key={kpIdx} className="text-[10px] text-[var(--text-secondary)] flex items-start gap-1.5">
                                                                    <span className="w-1 h-1 rounded-full bg-indigo-500/40 mt-1.5 shrink-0" />
                                                                    {kp}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Citations */}
                                    {msg.type === 'citations' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Book size={15} className="text-indigo-600 dark:text-indigo-400" />
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Recommended Academic Sources</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {msg.citations.map((cite, idx) => (
                                                    <div key={idx} className={`p-3 rounded-xl ${innerCard} hover:border-indigo-500/30 transition-all`}>
                                                        <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{cite.inText}</span>
                                                        <p className="text-[10px] text-[var(--text-secondary)] italic leading-relaxed mt-2 mb-1.5">"{cite.reference}"</p>
                                                        <p className="text-[9px] text-[var(--text-secondary)] opacity-60 leading-relaxed border-t border-zinc-200 dark:border-white/5 pt-1.5">{cite.relevance}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Drafting spinner */}
                                    {msg.type === 'drafting_start' && (
                                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 relative">
                                                <Sparkles size={22} className="animate-pulse" />
                                                <div className="absolute inset-0 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">Drafting Chapter {msg.chapterNum}</h3>
                                                <p className="text-[10px] text-[var(--text-secondary)]">Writing each paragraph with academic rigor…</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Draft segment */}
                                    {msg.type === 'draft_segment' && (
                                        <div className="para-card group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{msg.heading}</h4>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/15 font-bold uppercase tracking-wider">Drafted</span>
                                            </div>
                                            <p className="text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                                                {msg.content}
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/5 flex justify-end">
                                                <button className="text-[9px] font-bold text-[var(--text-secondary)] opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center gap-1">
                                                    Refine Section
                                                    <ChevronRight size={9} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chapter complete inline notice */}
                                    {msg.type === 'chapter_complete' && (
                                        <div className="flex items-center gap-2.5 py-1">
                                            <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[var(--text-primary)]">Chapter {msg.chapterNum} Complete!</p>
                                                <p className="text-[10px] text-[var(--text-secondary)]">Use the action bar below to continue to Chapter {msg.nextChapter}.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dissertation complete */}
                                    {msg.type === 'dissertation_complete' && (
                                        <div className="space-y-3 text-center py-4">
                                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mx-auto">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Dissertation Complete! 🎉</h3>
                                                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">All 5 chapters have been written. Use the Export button to download your full dissertation.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Plain text */}
                                    {!msg.type && <p className="text-xs leading-relaxed whitespace-pre-wrap text-left">{msg.content}</p>}

                                    {/* Hover copy icon */}
                                    {msg.role === 'ai' && msg.type !== 'welcome' && msg.type !== 'topics' && (
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                                <Paperclip size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <User size={15} />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                            <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Sparkles size={15} className="animate-spin" />
                            </div>
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-60 px-1">Thinking</span>
                                <div className="p-3 px-4 rounded-xl bg-indigo-500/10 border border-indigo-500/15 rounded-tl-sm">
                                    <div className="flex gap-1">
                                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Sticky action bar */}
            <AnimatePresence mode="wait">
                {renderActionBar()}
            </AnimatePresence>
        </div>
    );
};

export default ChatThread;
