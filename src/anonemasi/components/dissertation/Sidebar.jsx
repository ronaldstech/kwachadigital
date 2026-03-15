import {
    PlusCircle,
    History,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    LayoutDashboard,
    X,
    LogOut,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = ({
    dissState,
    savedDissertations,
    onBack,
    onLoadDissertation,
    onStartNew,
    isOpen,
    onClose,
    onUpgradeClick
}) => {
    const { user, logout } = useAuth();

    const chapters = Object.entries(dissState.chapters);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const sidebarContent = (
        <aside className={`w-64 h-full border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d0d0f] flex flex-col z-50 shrink-0 shadow-2xl lg:shadow-none`}>
            {/* Header / Brand */}
            <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold font-outfit text-[var(--text-primary)]">Anonemasi</h1>
                        <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Dissertation Pro</p>
                    </div>
                </div>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="p-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-400 dark:text-white/40 hover:text-zinc-800 dark:hover:text-white transition-colors text-xs font-medium group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Matrix
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
                {/* New Session */}
                <button
                    onClick={() => { onStartNew(); onClose?.(); }}
                    className="w-full p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-2.5 group text-sm font-bold"
                >
                    <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                    New Dissertation
                </button>

                {/* Current Progress */}
                {dissState.topic && (
                    <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                            <Clock size={10} />
                            Active Project
                        </h3>
                        <p className="text-[10px] text-[var(--text-secondary)] px-1 line-clamp-2 leading-relaxed mb-2">{dissState.topic}</p>
                        <div className="space-y-0.5">
                            {chapters.map(([num, chapter]) => {
                                const isActive = parseInt(num) === dissState.currentChapter;
                                const isCompleted = chapter.approved;

                                return (
                                    <button
                                        key={num}
                                        onClick={() => onClose?.()}
                                        className={`w-full px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-all text-left group ${isActive
                                            ? 'bg-indigo-50 dark:bg-white/5 border border-indigo-200 dark:border-white/10 text-[var(--text-primary)]'
                                            : 'text-zinc-500 dark:text-white/40 hover:text-[var(--text-primary)] hover:bg-zinc-100 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-mono border shrink-0 ${isActive
                                            ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                                            : isCompleted
                                                ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400'
                                                : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-white/20'
                                            }`}>
                                            {isCompleted ? <CheckCircle2 size={10} /> : num}
                                        </div>
                                        <span className="text-[11px] font-medium truncate flex-1">{chapter.title}</span>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Saved Projects */}
                {savedDissertations?.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                            <History size={10} />
                            Saved Assignments
                        </h3>
                        <div className="space-y-1">
                            {savedDissertations.map((item) => {
                                // A dissertation is completed if the flag is set OR if Chapter 5 is finished
                                const isCompleted = item.completed || (item.chapters?.[5]?.approved && item.chapters?.[5]?.content);
                                const isActive = item.id === dissState.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { onLoadDissertation(item.id); onClose?.(); }}
                                        className={`w-full p-3 rounded-xl border transition-all text-left active:scale-[0.98] group relative ${isActive
                                            ? 'ring-2 ring-indigo-500/50 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                            : isCompleted
                                                ? 'bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20 hover:border-green-400'
                                                : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/5'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <p className={`text-[11px] font-bold line-clamp-1 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-green-700 dark:text-green-400' : 'text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                                        }`}>
                                                        {item.topic}
                                                    </p>
                                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[9px] text-[var(--text-secondary)] flex items-center gap-1">
                                                        <LayoutDashboard size={9} />
                                                        {item.program}
                                                    </p>
                                                    {item.plan === 'pro' && (
                                                        <span className="flex items-center gap-0.5 px-1 py-0.25 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-tighter border border-indigo-500/20">
                                                            <Zap size={7} fill="currentColor" />
                                                            Pro
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isCompleted && !isActive && (
                                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm shadow-green-500/20">
                                                    <CheckCircle2 size={10} />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all group relative">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 shrink-0 overflow-hidden ring-2 ring-white dark:ring-zinc-900">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            getInitials(user?.name || 'User')
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[var(--text-primary)] truncate">{user?.name || 'Loading...'}</p>
                        <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${dissState?.plan === 'pro'
                                ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                                : 'bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                                }`}>
                                {dissState?.plan === 'pro' ? 'Pro' : 'Free'}
                            </span>
                            {dissState?.plan !== 'pro' && (
                                <button
                                    onClick={onUpgradeClick}
                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/20 hover:scale-105 transition-all"
                                >
                                    <Zap size={8} fill="currentColor" />
                                    Upgrade
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => logout()}
                        title="Logout"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex h-full">
                {sidebarContent}
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-[70] lg:hidden"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
