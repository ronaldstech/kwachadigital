import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDissertation } from '../hooks/useDissertation';
import Sidebar from '../components/dissertation/Sidebar';
import ChatThread from '../components/dissertation/ChatThread';
import InputPanel from '../components/dissertation/InputPanel';
import ChapterTracker from '../components/dissertation/ChapterTracker';
import TopicGenModal from '../components/dissertation/Modals/TopicGenModal';
import PreviewModal from '../components/dissertation/Modals/PreviewModal';
import SubscriptionModal from '../components/dissertation/Modals/SubscriptionModal';

const DissertationTool = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        dissState,
        savedDissertations,
        messages,
        loading,
        generateTopics,
        selectTopic,
        setManualTopic,
        approvePlan,
        loadDissertation,
        startNewDissertation,
        exportFullToPDF,
        exportFullToWord,
        draftChapter,
        generateChapterPlan,
        addMessage,
        buyPro
    } = useDissertation();

    const [topicModalOpen, setTopicModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

    const handleStartChapter = (chapterNum) => {
        generateChapterPlan(chapterNum, dissState.topic);
    };


    // Fix mobile layout: reset any scroll/overflow state carried over from the landing page
    useEffect(() => {
        // Scroll to top and remove any overflow locks the home page may have set
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.position = '';

        return () => {
            // Restore defaults when leaving the tool
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, []);


    const currentChapterData = dissState.chapters[dissState.currentChapter];

    return (
        <div className="flex h-screen bg-bg-main text-text-primary font-sans overflow-hidden relative">
            {/* Sidebar */}
            <Sidebar
                dissState={dissState}
                savedDissertations={savedDissertations}
                onBack={() => navigate('/ai-tools')}
                onLoadDissertation={loadDissertation}
                onStartNew={startNewDissertation}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onUpgradeClick={() => setIsSubscriptionOpen(true)}
            />

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-14 lg:h-12 border-b border-glass-border px-4 lg:px-5 flex items-center justify-between backdrop-blur-md bg-surface-1/80 z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <ChapterTracker currentChapter={dissState.currentChapter} completed={dissState.completed} />
                    </div>

                    <div className="flex items-center gap-1.5 lg:gap-2">
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg border border-glass-border hover:bg-surface-2 transition-all text-[10px] lg:text-xs font-medium text-text-secondary"
                        >
                            <Eye size={14} className="hidden xs:block" />
                            Preview
                        </button>
                        <button
                            onClick={exportFullToWord}
                            disabled={!dissState.topic}
                            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-1 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-bold text-text-primary border border-glass-border"
                        >
                            <Download size={14} className="text-blue-500 hidden xs:block" />
                            Word
                        </button>
                        <button
                            onClick={exportFullToPDF}
                            disabled={!dissState.topic}
                            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
                        >
                            <Download size={14} className="hidden xs:block" />
                            PDF
                        </button>
                    </div>
                </header>

                {/* Chat / Work Area */}
                <div className="flex-1 overflow-hidden relative bg-bg-main">
                    <ChatThread
                        messages={messages}
                        loading={loading}
                        onSelectTopic={selectTopic}
                        onApprovePlan={approvePlan}
                        onStartTopicGen={() => setTopicModalOpen(true)}
                        draftChapter={draftChapter}
                        onStartChapter={handleStartChapter}
                        onExportWord={exportFullToWord}
                        onExportPDF={exportFullToPDF}
                        onUpgradeClick={() => setIsSubscriptionOpen(true)}
                    />
                </div>

                {/* Input Area */}
                <InputPanel
                    loading={loading}
                    onSend={(val) => {
                        if (dissState.currentChapter === 0) {
                            setManualTopic(val);
                        } else {
                            addMessage({ role: 'user', content: val });
                        }
                    }}
                />
            </main>


            <TopicGenModal
                isOpen={topicModalOpen}
                onClose={() => setTopicModalOpen(false)}
                onGenerate={generateTopics}
            />

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                topic={dissState.topic}
                chapterTitle={currentChapterData?.title}
                content={currentChapterData?.content}
            />

            <SubscriptionModal
                isOpen={isSubscriptionOpen}
                onClose={() => setIsSubscriptionOpen(false)}
                onUpgrade={buyPro}
                userName={user?.name}
                userEmail={user?.email}
                dissertationId={dissState.id}
                userId={user?.uid}
            />
        </div>
    );
};

export default DissertationTool;
