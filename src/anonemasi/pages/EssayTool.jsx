import React, { useState, useEffect } from 'react';
import { Download, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEssay } from '../hooks/useEssay';
import Sidebar from '../components/essay/Sidebar';
import ChatThread from '../components/essay/ChatThread';
import InputPanel from '../components/essay/InputPanel';
import PaymentModal from '../components/essay/PaymentModal';

const EssayTool = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        essayState,
        savedEssays,
        messages,
        loading,
        loadEssay,
        startNewEssay,
        deleteEssay,
        performAnalysis,
        findCitations,
        createPlan,
        draftAllParagraphs,
        exportToWord,
        exportToPDF,
        addMessage
    } = useEssay();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingRequirements, setPendingRequirements] = useState("");


    // Fix mobile layout: reset any scroll/overflow state carried over from the landing page
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.position = '';

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, []);


    return (
        <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-primary)] font-sans overflow-hidden relative">
            {/* Sidebar */}
            <Sidebar
                essayState={essayState}
                savedEssays={savedEssays}
                onBack={() => navigate('/ai-tools')}
                onLoadEssay={loadEssay}
                onStartNew={startNewEssay}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onUpgradeClick={() => setShowPaymentModal(true)}
            />

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--bg-color)]">
                {/* Top Header */}
                <header className="h-14 lg:h-12 border-b border-[var(--glass-border)] px-4 lg:px-5 flex items-center justify-between backdrop-blur-md bg-[var(--glass-bg)] z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        {/* Simple status indicator instead of ChapterTracker */}
                        {essayState.topic && (
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="text-xs font-bold truncate max-w-[200px]">{essayState.topic}</span>
                                {essayState.references && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-600 border border-green-500/20">
                                        Complete
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 lg:gap-2">
                        <button
                            onClick={exportToWord}
                            disabled={!essayState.references}
                            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-bold text-[var(--text-primary)] border border-zinc-200 dark:border-white/10"
                        >
                            <Download size={14} className="text-blue-500 hidden xs:block" />
                            Word
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={!essayState.references}
                            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
                        >
                            <Download size={14} className="hidden xs:block" />
                            PDF
                        </button>
                    </div>
                </header>

                {/* Chat / Work Area */}
                <div className="flex-1 overflow-hidden relative">
                    <ChatThread
                        messages={messages}
                        loading={loading}
                        essayState={essayState}
                        onFindCitations={findCitations}
                        onCreatePlan={createPlan}
                        onDraftAll={draftAllParagraphs}
                        onExportWord={exportToWord}
                        onExportPDF={exportToPDF}
                        onUpgradeClick={() => setIsSubscriptionOpen(true)}
                    />
                </div>

                {/* Input Area */}
                <InputPanel
                    loading={loading}
                    onSend={async (val) => {
                        if (!essayState.topic) {
                            const res = await performAnalysis(val);
                            if (res && res.requirePayment) {
                                setPendingRequirements(val);
                                setShowPaymentModal(true);
                            }
                        } else {
                            addMessage({ role: 'user', content: val });
                            // The AI doesn't actively converse during the pipeline unless modifying plan,
                            // but we allow sending messages as notes or if we implement edit flows.
                            // To keep it simple, we just echo.
                        }
                    }}
                />
            </main>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={async () => {
                    setShowPaymentModal(false);
                    if (pendingRequirements) {
                        await performAnalysis(pendingRequirements);
                        setPendingRequirements("");
                    }
                }}
                userName={user?.name}
                userEmail={user?.email}
                userId={user?.uid}
            />
        </div>
    );
};

export default EssayTool;
