import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Send,
    Plus,
    Download,
    Settings,
    History,
    Layout,
    FileText,
    Type,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Upload,
    Zap,
    CheckCircle2,
    AlertCircle,
    X,
    Sidebar as SidebarIcon,
    Sparkles,
    Palette,
    Target,
    Copy,
    Trash2,
    FilePlus,
    ArrowLeft
} from "lucide-react";
import "./PowerPointTool.css";

import { usePowerPoint } from "../hooks/usePowerPoint";
import { buildFreshPptx, buildTemplatePptx } from "../services/powerpointService";
import PaymentModal from "../components/powerpoint/PaymentModal";
import { useAuth } from '../../context/AuthContext';

const PowerPointTool = () => {
    const navigate = useNavigate();
    // Custom Hook State
    const {
        powerPointState,
        savedPowerPoints,
        messages,
        files,
        loading,
        setFiles,
        loadPowerPoint,
        startNewPowerPoint,
        deletePowerPoint,
        updateConfig,
        runGeneration,
        handleFileUpload
    } = usePowerPoint();

    const { user } = useAuth();

    // UI State
    const [activePanel, setActivePanel] = useState("sources"); // sources, template, customize, copycat
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [isDesktop, setIsDesktop] = useState(true);
    const [userInput, setUserInput] = useState("");
    const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

    const { slides, config, extData } = powerPointState;

    // Reset slide index when loading new slides
    useEffect(() => {
        if (slides.length > 0 && currentSlideIdx >= slides.length) {
            setCurrentSlideIdx(0);
        }
    }, [slides, currentSlideIdx]);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1024);
        handleResize(); // Initialize on mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Sync busy state with loading
    useEffect(() => {
        setIsBusy(loading);
    }, [loading]);

    const addToast = (msg, type = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const handleUploadClick = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await handleFileUpload(file, type);
        if (res.success) {
            addToast(res.message, "success");
        } else {
            addToast(res.message, "error");
        }
        // Reset input so the same file can be uploaded again if needed
        e.target.value = null;
    };

    const handleRunGeneration = async () => {
        if (!userInput.trim() && !extData.mainText) {
            addToast("Please provide a topic or upload a document", "warning");
            return;
        }

        const inputToRun = userInput;
        setUserInput("");
        const res = await runGeneration(inputToRun);
        if (res.success) {
            setCurrentSlideIdx(0);
            addToast("Slides generated!", "success");
        } else if (res.requirePayment) {
            setUserInput(inputToRun);
            setShowPaymentModal(true);
        } else {
            setUserInput(inputToRun); // Restore input on error to not lose text
            addToast(res.message, "error");
        }
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);
        // The modal waits 3.5 seconds before calling this, so we can run generation.
        const inputToRun = userInput;
        if (!inputToRun && !extData.mainText) return;
        setUserInput("");
        const res = await runGeneration(inputToRun);
        if (res.success) {
            setCurrentSlideIdx(0);
            addToast("Slides generated!", "success");
        } else {
            addToast(res.message, "error");
        }
    };

    const handleDownload = async () => {
        if (!slides.length) return;
        setIsBusy(true);
        try {
            if (config.style === "template" && files.template) {
                const ab = await files.template.arrayBuffer();
                await buildTemplatePptx(slides, ab);
            } else {
                const theme = config.style === "copycat" && extData.ccTheme ? extData.ccTheme : extData.tplTheme || {
                    bg: "1E3A5F", accent: "FFFFFF", text: "FFFFFF", sub: "BBCCDD",
                    bodyBg: "FFFFFF", bodyText: "111111", bodyAccent: "1E3A5F", bodySub: "555555"
                };
                await buildFreshPptx(slides, theme);
            }
            addToast("Download started", "success");
        } catch (err) {
            addToast("Export failed: " + err.message, "error");
        } finally {
            setIsBusy(false);
        }
    };

    const currentSlide = slides[currentSlideIdx];

    return (
        <div className="pp-container pp-tool-layout font-sans">
            {/* Sidebar / Controls */}
            <AnimatePresence>
                {(isMobileMenuOpen || isDesktop) && (
                    <motion.aside
                        initial={isDesktop ? false : { x: -280 }}
                        animate={{ x: 0 }}
                        exit={isDesktop ? false : { x: -280 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`pp-sidebar p-5 gap-6 ${isMobileMenuOpen ? "pp-sidebar-mobile" : ""} relative z-50`}
                    >
                        {showHistory ? (
                            // History Sidebar Content
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                    <button onClick={() => navigate('/ai-tools/powerpoint')} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-[var(--pp-text-dim)]">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <h2 className="font-bold text-lg">History</h2>
                                    </div>
                                    <button onClick={startNewPowerPoint} className="p-1.5 hover:bg-indigo-500/10 text-indigo-500 rounded-lg transition-colors">
                                        <FilePlus size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-2 pp-scroll-hide">
                                    {savedPowerPoints.length === 0 ? (
                                        <div className="text-center py-10 opacity-50">
                                            <History size={32} className="mx-auto mb-3" />
                                            <p className="text-sm">No saved presentations yet</p>
                                        </div>
                                    ) : (
                                        savedPowerPoints.map(ppt => (
                                            <div
                                                key={ppt.id}
                                                className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${powerPointState.id === ppt.id
                                                    ? 'bg-indigo-500/10 border-indigo-500/30'
                                                    : 'bg-white/5 border-[var(--pp-border)] hover:bg-white/10'
                                                    }`}
                                                onClick={() => {
                                                    loadPowerPoint(ppt.id);
                                                    if (!isDesktop) setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-sm font-semibold truncate leading-tight">
                                                        {ppt.topic || "Untitled Presentation"}
                                                    </h3>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deletePowerPoint(ppt.id); }}
                                                        className="text-red-400 hover:text-red-300 p-1 opacity-0 hover:opacity-100 transition-opacity"
                                                        style={{ opacity: isDesktop ? undefined : 1 }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-[var(--pp-text-dim)]">
                                                    <span>{ppt.slides?.length || 0} slides</span>
                                                    <span>{ppt.lastModified?.toDate().toLocaleDateString() || "Just now"}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Main Controls Sidebar Content
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                                            <Layout className="text-white w-6 h-6" />
                                        </div>
                                        <h1 className="font-bold text-xl tracking-tight">PPT Gen</h1>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-[var(--pp-text-dim)]">
                                        <X size={24} />
                                    </button>
                                </div>

                                <nav className="flex flex-col gap-2">
                                    <button
                                        onClick={() => navigate('/ai-tools')}
                                        className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 text-[var(--pp-text-dim)] border border-white/5 mb-2"
                                    >
                                        <ArrowLeft size={18} />
                                        <span className="text-sm font-semibold">Back to Matrix</span>
                                    </button>
                                    {[
                                        { id: "sources", icon: <FileText size={18} />, label: "Sources" },
                                        { id: "template", icon: <Palette size={18} />, label: "Template" },
                                        { id: "customize", icon: <Settings size={18} />, label: "Customize" },
                                        { id: "copycat", icon: <Copy size={18} />, label: "Copycat" }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActivePanel(tab.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activePanel === tab.id
                                                ? "bg-indigo-600/10 text-indigo-500 font-semibold"
                                                : "hover:bg-white/5 text-[var(--pp-text-dim)]"
                                                }`}
                                        >
                                            {tab.icon}
                                            <span className="text-sm">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>

                                <div className="mt-auto pt-6 border-t border-[var(--pp-border)]">
                                    <div className="pp-glass-card p-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--pp-text-dim)] mb-3 flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-500" /> Tool Active
                                        </h3>
                                        {activePanel === "sources" && (
                                            <div className="space-y-3">
                                                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--pp-border)] rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                                                    <Upload size={20} className="mb-2 text-indigo-500" />
                                                    <span className="text-[10px] text-center">Upload PDF/Docs</span>
                                                    <input type="file" className="hidden" onChange={(e) => handleUploadClick(e, "sources")} accept=".pdf,.docx" />
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {files.sources.map((f, i) => (
                                                        <div key={i} className="pp-badge flex items-center gap-1">
                                                            <FileText size={10} /> {f.name.slice(0, 10)}...
                                                            <X size={10} className="cursor-pointer" onClick={() => {
                                                                setFiles(prev => ({ ...prev, sources: prev.sources.filter((_, idx) => idx !== i) }));
                                                                addToast("Source removed");
                                                            }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activePanel === "template" && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] text-[var(--pp-text-dim)]">Preserve design from an existing PPTX.</p>
                                                <label className="flex items-center gap-2 p-2 bg-indigo-500/20 text-indigo-400 rounded-lg cursor-pointer hover:bg-indigo-500/30 transition-colors text-xs font-medium justify-center">
                                                    <Palette size={14} /> {files.template ? "Change Template" : "Select PPTX"}
                                                    <input type="file" className="hidden" onChange={(e) => handleUploadClick(e, "template")} accept=".pptx" />
                                                </label>
                                                {files.template && <div className="text-[10px] text-center font-medium text-indigo-500">{files.template.name}</div>}
                                            </div>
                                        )}

                                        {activePanel === "customize" && (
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[var(--pp-text-dim)]">Slide Count</label>
                                                    <input
                                                        type="range" min="3" max="25" value={config.slideCount}
                                                        onChange={(e) => updateConfig({ slideCount: parseInt(e.target.value) })}
                                                        className="w-full accent-indigo-500"
                                                    />
                                                    <div className="flex justify-between text-[10px] font-medium"><span>3</span> <span>{config.slideCount} slides</span> <span>25</span></div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[var(--pp-text-dim)]">Audience</label>
                                                    <select
                                                        value={config.audience}
                                                        onChange={(e) => updateConfig({ audience: e.target.value })}
                                                        className="w-full bg-white/5 border border-[var(--pp-border)] rounded-lg p-1 text-[10px]"
                                                    >
                                                        <option value="Professional">Professional</option>
                                                        <option value="Academic">Academic</option>
                                                        <option value="Creative">Creative</option>
                                                        <option value="General">General</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {activePanel === "copycat" && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] text-[var(--pp-text-dim)]">Mirror slide structure & count from a reference PPTX.</p>
                                                <label className="flex items-center gap-2 p-2 bg-purple-500/20 text-purple-400 rounded-lg cursor-pointer hover:bg-purple-500/30 transition-colors text-xs font-medium justify-center">
                                                    <Copy size={14} /> {files.copycat ? "Change Reference" : "Select PPTX"}
                                                    <input type="file" className="hidden" onChange={(e) => handleUploadClick(e, "copycat")} accept=".pptx" />
                                                </label>
                                                {files.copycat && <div className="text-[10px] text-center font-medium text-purple-500">{files.copycat.name}</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Backdrop for mobile menu */}
            {isMobileMenuOpen && (
                <div onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[95]" />
            )}

            {/* Main Chat Area */}
            <main className="pp-main-content">
                <header className="flex items-center justify-between p-4 lg:p-5 border-b border-[var(--pp-border)] relative z-20">
                    <div className="flex items-center gap-3 w-1/2">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-[var(--pp-text-dim)] flex-shrink-0">
                            <SidebarIcon size={20} />
                        </button>
                        <motion.div animate={isBusy ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="flex-shrink-0">
                            {isBusy ? <Sparkles className="text-indigo-500 w-5 h-5" /> : <Target className="text-indigo-500 w-5 h-5" />}
                        </motion.div>
                        <span className="font-bold text-sm lg:text-base truncate">{powerPointState.topic || "Project Workspace"}</span>
                        {isBusy && <span className="text-[10px] lg:text-xs text-indigo-500 animate-pulse ml-2 hidden sm:inline flex-shrink-0">Architecting...</span>}
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                        <button onClick={() => setShowPreview(!showPreview)} className="hidden lg:flex pp-btn-ghost items-center gap-2 text-xs">
                            <Maximize2 size={14} /> {showPreview ? "Hide Preview" : "Show Preview"}
                        </button>
                        <button onClick={() => setIsMobilePreviewOpen(true)} className="lg:hidden p-2 text-indigo-500 bg-indigo-500/10 rounded-lg">
                            <Layout size={20} />
                        </button>
                        <button
                            onClick={() => {
                                setShowHistory(true);
                                if (!isDesktop) setIsMobileMenuOpen(true);
                            }}
                            className="pp-btn-ghost hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors"
                            title="History"
                        >
                            <History size={18} />
                        </button>
                    </div>
                </header>

                <div className="pp-chat-area pp-scroll-hide">
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20"
                                : "bg-white/5 border border-[var(--pp-border)] rounded-tl-none"
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                {m.actionable && slides.length > 0 && (
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={handleDownload} className="pp-btn-primary flex items-center gap-2 text-xs py-2">
                                            <Download size={14} /> Download .pptx
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isBusy && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                            <div className="bg-white/5 border border-[var(--pp-border)] rounded-2xl rounded-tl-none p-4 max-w-[80%] flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex flex-shrink-0 items-center justify-center relative">
                                    <Sparkles size={18} className="animate-pulse" />
                                    <div className="absolute inset-0 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-sm font-bold text-white m-0 leading-tight">Architecting Presentation</h3>
                                    <p className="text-[11px] text-[var(--pp-text-dim)] m-0 leading-tight">Extracting insights and formatting slides...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <div className="pp-input-container p-4 lg:p-6 z-20">
                    <div className="relative group">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleRunGeneration())}
                            placeholder="Describe your presentation... (e.g., '12-slide summary of the attached PDF')"
                            className="w-full bg-white/5 border border-[var(--pp-border)] rounded-2xl p-4 pr-14 min-h-[80px] lg:min-h-[100px] text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all group-hover:bg-white/[0.07]"
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <label className="pp-btn-ghost p-1.5 cursor-pointer">
                                <Plus size={20} className="text-[var(--pp-text-dim)]" />
                                <input type="file" className="hidden" onChange={(e) => handleUploadClick(e, "main")} />
                            </label>
                            <button
                                onClick={handleRunGeneration}
                                disabled={isBusy || (!userInput.trim() && !extData.mainText)}
                                className="bg-indigo-600 p-2 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/20"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Slide Preview Panel */}
            <AnimatePresence>
                {((showPreview && isDesktop) || isMobilePreviewOpen) && (
                    <motion.aside
                        initial={isDesktop ? { width: 0, opacity: 0 } : { y: "100%" }}
                        animate={isDesktop ? { width: 340, opacity: 1 } : { y: 0 }}
                        exit={isDesktop ? { width: 0, opacity: 0 } : { y: "100%" }}
                        transition={{ duration: 0.2 }}
                        className={`pp-preview-panel pp-scroll-hide ${isMobilePreviewOpen ? "pp-preview-mobile" : ""} relative z-50`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold flex items-center gap-2">
                                <Layout size={18} className="text-indigo-500" /> Live Preview
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-[var(--pp-border)]">
                                    <button
                                        disabled={currentSlideIdx === 0}
                                        onClick={() => setCurrentSlideIdx(prev => prev - 1)}
                                        className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                    ><ChevronLeft size={16} /></button>
                                    <span className="text-[10px] font-bold px-1">{currentSlideIdx + 1} / {slides.length || 1}</span>
                                    <button
                                        disabled={currentSlideIdx === slides.length - 1 || !slides.length}
                                        onClick={() => setCurrentSlideIdx(prev => prev + 1)}
                                        className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                    ><ChevronRight size={16} /></button>
                                </div>
                                {isMobilePreviewOpen && (
                                    <button onClick={() => setIsMobilePreviewOpen(false)} className="lg:hidden p-2 text-[var(--pp-text-dim)]">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* ... rest of the preview content ... */}
                        {slides.length > 0 && currentSlide ? (
                            <div className="space-y-4">
                                <div className="pp-slide-preview">
                                    <div className="pp-slide-content">
                                        {currentSlide.type === "title" ? (
                                            <div className="h-full flex flex-col justify-center items-center text-center">
                                                <h3 className="pp-slide-title text-indigo-900">{currentSlide.title}</h3>
                                                <p className="text-indigo-600/70 text-sm font-medium italic">{currentSlide.subtitle}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="pp-slide-title text-indigo-900 border-b border-indigo-100 pb-2">{currentSlide.title}</h3>
                                                {currentSlide.paragraph ? (
                                                    <p className="text-xs leading-relaxed text-indigo-800/80">{currentSlide.paragraph}</p>
                                                ) : (
                                                    <ul className="pp-slide-bullets">
                                                        {(currentSlide.bullets || []).map((b, i) => (
                                                            <li key={i} className="pp-slide-bullet text-[10px] text-indigo-800/80">{b}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pp-glass-card p-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--pp-text-dim)] mb-2">Slide Data</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-[var(--pp-text-dim)]">Type</span>
                                            <span className="font-bold text-indigo-500 uppercase">{currentSlide.type}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-[var(--pp-text-dim)]">Words</span>
                                            <span className="font-bold">{JSON.stringify(currentSlide).length / 6 | 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-center opacity-30">
                                <Layout size={48} className="mb-4" />
                                <p className="text-xs font-medium">Generate a presentation to see the preview</p>
                            </div>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Toasts */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[100]">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border ${toast.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                    toast.type === "warning" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                                        "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                                }`}
                        >
                            {toast.type === "success" ? <CheckCircle2 size={16} /> :
                                toast.type === "error" ? <AlertCircle size={16} /> :
                                    toast.type === "warning" ? <AlertCircle size={16} /> :
                                        <Sparkles size={16} />}
                            <span className="text-sm font-medium">{toast.msg}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Invisible Overlay to block inputs while busy (but maintains UI visibility) */}
            {isBusy && (
                <div className="fixed inset-0 z-[90] cursor-wait pointer-events-auto bg-transparent" />
            )}

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
                userName={user?.name || ""}
                userEmail={user?.email || ""}
                userId={user?.uid || ""}
            />
        </div>
    );
};

export default PowerPointTool;
