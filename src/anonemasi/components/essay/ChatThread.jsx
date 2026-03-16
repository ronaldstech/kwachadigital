import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, User, Book, CheckCircle2, List, ChevronRight, Paperclip, Trophy, ArrowRight, Download, Zap, BrainCircuit, FileSearch } from 'lucide-react';

const ACTIONABLE_TYPES = ['essay_analysis', 'essay_sources', 'essay_plan', 'essay_complete'];

const ChatThread = ({
    messages,
    loading,
    onFindCitations,
    onCreatePlan,
    onDraftAll,
    onExportWord,
    onExportPDF,
    onUpgradeClick,
    essayState
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

        const baseBar = "flex flex-col xs:flex-row items-center justify-between gap-3 px-4 py-3 xs:py-2.5 bg-surface-1 border-t border-glass-border";

        if (pendingAction.type === 'essay_analysis') {
            return (
                <motion.div key="analysis-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <BrainCircuit size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-text-primary">Analysis Complete</p>
                            <p className="text-[10px] text-text-secondary">Topic and themes identified.</p>
                        </div>
                    </div>
                    <button
                        onClick={onFindCitations}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25 transition-all text-xs font-bold shrink-0"
                    >
                        <FileSearch size={13} />
                        Find Citations
                    </button>
                </motion.div>
            );
        }

        if (pendingAction.type === 'essay_sources') {
            return (
                <motion.div key="sources-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Book size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-text-primary">Sources Found</p>
                            <p className="text-[10px] text-text-secondary">Academic references have been attached.</p>
                        </div>
                    </div>
                    <button
                        onClick={onCreatePlan}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-500/20 shrink-0"
                    >
                        <List size={13} />
                        Create Essay Plan
                    </button>
                </motion.div>
            );
        }

        if (pendingAction.type === 'essay_plan') {
            return (
                <motion.div key="plan-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                            <List size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-text-primary">Paragraph Plan Ready</p>
                            <p className="text-[10px] text-text-secondary">Review the outline. Ready to draft?</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onDraftAll()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all text-xs font-bold shadow-lg shadow-purple-500/20 shrink-0"
                    >
                        Start Drafting <ArrowRight size={13} />
                    </button>
                </motion.div>
            );
        }

        if (pendingAction.type === 'essay_complete') {
            return (
                <motion.div key="essay-complete-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={baseBar}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                            <Trophy size={13} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-text-primary">Essay Complete!</p>
                            <p className="text-[10px] text-text-secondary">Your essay and references are ready.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExportWord}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-1 text-text-primary transition-all text-xs font-bold shrink-0 border border-glass-border"
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

    const aiCard = "bg-surface-1 border border-glass-border rounded-tl-sm";
    const innerCard = "bg-surface-2 border border-glass-border";

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
                                <div className="w-8 h-8 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <PenTool size={15} />
                                </div>
                            )}

                            <div className={`flex flex-col gap-1 max-w-[88%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary opacity-60 px-1">
                                    {msg.role === 'user' ? 'You' : 'Anonemasi AI'}
                                </span>

                                <div className={`p-4 rounded-xl border relative group text-sm ${msg.role === 'user'
                                    ? 'bg-purple-500/10 border-purple-500/20 rounded-tr-sm text-purple-800 dark:text-purple-200'
                                    : `${aiCard} text-text-primary`
                                    }`}>

                                    {/* Welcome */}
                                    {msg.type === 'essay_welcome' && (
                                        <div className="space-y-4 text-center py-3">
                                            <div>
                                                <h2 className="text-xl font-bold font-outfit text-text-primary mb-1">Welcome to Essay Weaver.</h2>
                                                <p className="text-xs leading-relaxed text-text-secondary max-w-md mx-auto">
                                                    I'll analyze your essay prompt, find scholarly sources, draft an outline, and write your essay with perfect APA citations.
                                                </p>
                                            </div>
                                            <div className="flex justify-center mt-4 text-text-muted">
                                                <span className="text-xs italic bg-surface-2 px-4 py-2 rounded-lg border border-glass-border">Type or paste your prompt in the box below</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Analysis */}
                                    {msg.type === 'essay_analysis' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <BrainCircuit size={15} className="text-blue-600 dark:text-blue-400" />
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Analysis Complete</h3>
                                            </div>
                                            <div className={`p-3 rounded-xl ${innerCard}`}>
                                                <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">Topic Identified</h4>
                                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3">{msg.analysis.topic}</p>

                                                <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">Key Themes</h4>
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {msg.analysis.keyThemes?.map((theme, idx) => (
                                                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/15">
                                                            {theme}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-white/10 flex flex-wrap gap-2 text-[10px]">
                                                    <span className="bg-zinc-200 dark:bg-white/10 px-2 py-1 rounded text-[var(--text-secondary)]">
                                                        Style: <strong className="text-[var(--text-primary)]">{msg.analysis.essayType}</strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sources */}
                                    {msg.type === 'essay_sources' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Book size={15} className="text-indigo-600 dark:text-indigo-400" />
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Academic Sources Found</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {msg.sources?.map((s, idx) => (
                                                    <div key={idx} className={`p-3 rounded-xl ${innerCard}`}>
                                                        <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1 flex items-start gap-2">
                                                            <span className="w-4 h-4 rounded bg-indigo-500/10 flex items-center justify-center text-[9px] font-mono text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">{idx + 1}</span>
                                                            {s.title}
                                                        </h4>
                                                        <p className="text-[11px] text-[var(--text-secondary)] pl-6 mb-1">
                                                            {s.author} ({s.year}) &bull; <span className="italic">{s.journal || s.publisher || s.type}</span>
                                                        </p>
                                                        {s.relevance && (
                                                            <p className="text-[10px] text-[var(--text-secondary)] italic border-l-2 border-indigo-500/20 pl-2 ml-6">
                                                                {s.relevance}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Plan */}
                                    {msg.type === 'essay_plan' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <List size={15} className="text-purple-600 dark:text-purple-400" />
                                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Comprehensive Essay Plan</h3>
                                            </div>
                                            <div className="space-y-2.5">
                                                {msg.plan?.map((item, idx) => (
                                                    <div key={idx} className={`p-3 rounded-xl ${innerCard}`}>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                                <span className="w-4 h-4 rounded bg-purple-500/10 flex items-center justify-center text-[9px] font-mono text-purple-600 dark:text-purple-400 shrink-0">{idx + 1}</span>
                                                                {item.heading}
                                                            </h4>
                                                            <span className="text-[9px] font-medium text-zinc-400">{item.section} &bull; ~{item.words} words</span>
                                                        </div>
                                                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2 pl-6">{item.purpose}</p>
                                                        <div className="pl-6 flex flex-wrap gap-1">
                                                            {item.keyPoints?.map((kp, kpIdx) => (
                                                                <span key={kpIdx} className="text-[9px] bg-zinc-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-[var(--text-secondary)]">{kp}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Drafting Message */}
                                    {msg.type === 'essay_drafting' && (
                                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 relative">
                                                <PenTool size={22} className="animate-pulse" />
                                                <div className="absolute inset-0 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">Drafting Essay</h3>
                                                <p className="text-[10px] text-[var(--text-secondary)]">Currently writing each paragraph with academic rigor…</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Paragraph completion UI inside the main thread isn't modeled explicitly in standard message, but we can look for "content" or draft status from state later. We'll show standard text below. */}

                                    {/* Essay Complete */}
                                    {msg.type === 'essay_complete' && (
                                        <div className="space-y-3 text-center py-4">
                                            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Essay Complete! 🎉</h3>
                                                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">Your paragraphs and references have been drafted. Use the action bar below to export your work.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Plain text / Paragraphs */}
                                    {!msg.type && msg.role !== 'thinking' && (
                                        <div className="text-xs leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
                                            {msg.content}
                                        </div>
                                    )}

                                    {/* Thinking spinner */}
                                    {msg.role === 'thinking' && (
                                        <div className="flex items-center gap-2 text-xs italic text-[var(--text-secondary)]">
                                            <div className="w-3 h-3 border-2 border-[var(--text-secondary)] border-t-transparent rounded-full animate-spin" />
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <User size={15} />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Overall Loading indicator */}
                    {loading && !messages.some(m => m.role === 'thinking') && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                            <div className="w-8 h-8 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <PenTool size={15} className="animate-spin" />
                            </div>
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-60 px-1">Thinking</span>
                                <div className="p-3 px-4 rounded-xl bg-purple-500/10 border border-purple-500/15 rounded-tl-sm">
                                    <div className="flex gap-1">
                                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Render live drafts if drafting */}
                    {!loading && essayState.plan?.length > 0 && Object.keys(essayState.drafts).length > 0 && !messages.find(m => m.type === 'essay_complete') && (
                        <div className="space-y-4 max-w-3xl mt-6">
                            <div className="flex items-center justify-center mb-4">
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    Current Draft Progress
                                </span>
                            </div>
                            {essayState.plan.map((item, i) => {
                                if (!essayState.drafts[i]) return null;
                                return (
                                    <div key={`draft-${i}`} className={`p-4 rounded-xl border relative text-sm ${aiCard}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400">{item.heading}</h4>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/15 font-bold uppercase tracking-wider text-right">Drafted</span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-[var(--text-primary)]">
                                            {essayState.drafts[i]}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
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
