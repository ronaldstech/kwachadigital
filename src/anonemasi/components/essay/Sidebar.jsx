import {
    PlusCircle,
    History,
    ArrowLeft,
    PenTool,
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
    essayState,
    savedEssays,
    onBack,
    onLoadEssay,
    onStartNew,
    isOpen,
    onClose,
    onUpgradeClick
}) => {
    const { user, logout } = useAuth();

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const sidebarContent = (
        <aside className={`w-64 h-full border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d0d0f] flex flex-col z-50 shrink-0 shadow-2xl lg:shadow-none`}>
            {/* Header / Brand */}
            <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                        <PenTool size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold font-outfit text-[var(--text-primary)]">Anonemasi</h1>
                        <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Essay Weaver</p>
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
                    className="w-full p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-2.5 group text-sm font-bold"
                >
                    <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                    New Essay
                </button>

                {/* Current Progress */}
                {essayState.topic && (
                    <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                            <Clock size={10} />
                            Active Essay
                        </h3>
                        <p className="text-[10px] text-[var(--text-secondary)] px-1 line-clamp-2 leading-relaxed mb-2">{essayState.topic}</p>

                        {/* We don't have chapters, but we can show paragraph count or plan status */}
                        <div className="w-full px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-all bg-purple-50 dark:bg-white/5 border border-purple-200 dark:border-white/10 text-[var(--text-primary)]">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-mono border shrink-0 bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/40 text-purple-600 dark:text-purple-400">
                                <PenTool size={10} />
                            </div>
                            <span className="text-[11px] font-medium truncate flex-1">
                                {essayState.plan?.length > 0 ? `${essayState.plan.length} Paragraphs` : 'Planning...'}
                            </span>
                            {!essayState.references && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shrink-0" />}
                            {essayState.references && <CheckCircle2 size={12} className="text-green-500" />}
                        </div>
                    </div>
                )}

                {/* Saved Projects */}
                {savedEssays?.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                            <History size={10} />
                            Saved Essays
                        </h3>
                        <div className="space-y-1">
                            {savedEssays.map((item) => {
                                const isCompleted = Boolean(item.references);
                                const isActive = item.id === essayState.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { onLoadEssay(item.id); onClose?.(); }}
                                        className={`w-full p-3 rounded-xl border transition-all text-left active:scale-[0.98] group relative ${isActive
                                            ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 shadow-lg shadow-purple-500/10'
                                            : isCompleted
                                                ? 'bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20 hover:border-green-400'
                                                : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/5'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <p className={`text-[11px] font-bold line-clamp-1 transition-colors ${isActive ? 'text-purple-600 dark:text-purple-400' : isCompleted ? 'text-green-700 dark:text-green-400' : 'text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400'
                                                        }`}>
                                                        {item.topic || 'Untitled Essay'}
                                                    </p>
                                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[9px] text-[var(--text-secondary)] flex items-center gap-1">
                                                        <LayoutDashboard size={9} />
                                                        {item.essayType ? item.essayType.charAt(0).toUpperCase() + item.essayType.slice(1) : 'Standard'}
                                                    </p>
                                                    {item.plan === 'pro' && (
                                                        <span className="flex items-center gap-0.5 px-1 py-0.25 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase tracking-tighter border border-purple-500/20">
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
                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-purple-500/20 shrink-0 overflow-hidden ring-2 ring-white dark:ring-zinc-900">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            getInitials(user?.name || 'User')
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[var(--text-primary)] truncate">{user?.name || 'Loading...'}</p>
                        <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${essayState?.plan === 'pro'
                                ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20'
                                : 'bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                                }`}>
                                {essayState?.plan === 'pro' ? 'Pro' : 'Free'}
                            </span>
                            {essayState?.plan !== 'pro' && (
                                <button
                                    onClick={onUpgradeClick}
                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20 hover:scale-105 transition-all"
                                >
                                    <Zap size={8} fill="currentColor" />
                                    Upgrade
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick actions popup on hover */}
                    <div className="absolute right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="bg-white dark:bg-[#1a1a1c] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/5 p-1.5 flex flex-col gap-0.5 min-w-[140px]">
                            <button
                                onClick={() => { logout(); onClose?.(); }}
                                className="w-full px-3 py-2 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors text-left"
                            >
                                <LogOut size={12} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-full">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 lg:hidden shadow-2xl"
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
