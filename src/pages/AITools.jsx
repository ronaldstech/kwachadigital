import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    Sparkles,
    GraduationCap,
    Presentation,
    PenTool,
    ChevronRight,
    Cpu,
    Zap,
    BrainCircuit,
    Layers,
    History,
    CreditCard,
    ArrowUpRight
} from 'lucide-react';

const ToolCard = ({ tool, index }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.8, type: "spring", bounce: 0.4 }}
            className="perspective-1000 group relative h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
        >
            <div className="relative h-full bg-surface-1/60 rounded-[56px] border border-white/10 p-10 flex flex-col transition-all duration-700 hover:border-primary/50 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),0_20px_40px_-15px_rgba(0,0,0,0.5)] shadow-2xl overflow-hidden">
                {/* Dynamic Mesh Background */}
                <div className={`absolute -top-32 -right-32 w-80 h-80 blur-[120px] rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-1000 ${tool.color}`} />
                <div className={`absolute -bottom-32 -left-32 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000 ${tool.color}`} />

                {/* Status Badge & Actions */}
                <div className="flex items-start justify-between mb-12">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-24 h-24 rounded-[32px] flex items-center justify-center border-2 border-white/10 bg-white/5 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:shadow-[0_0_50px_rgba(16,185,129,0.15)]`}
                    >
                        <tool.icon size={44} className={`text-text-primary transition-colors duration-700 group-hover:text-primary ${tool.iconColor}`} />
                    </motion.div>

                    <div className="flex flex-col items-end gap-3 text-right">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{tool.status}</span>
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Module V.4.0</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative z-10">
                    <h3 className="text-4xl font-display font-[950] text-text-primary tracking-tighter leading-tight mb-4 group-hover:text-primary transition-colors duration-500">
                        {tool.name}
                    </h3>
                    <p className="text-[15px] font-medium text-text-secondary leading-relaxed opacity-60 mb-10 lowercase tracking-wide max-w-[90%]">
                        {tool.description}
                    </p>

                    {/* Feature Chips */}
                    <div className="flex flex-wrap gap-2 mb-12">
                        {tool.features.map((feature, i) => (
                            <div key={i} className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted/60 group-hover:text-primary/80 group-hover:border-primary/20 transition-all duration-500">
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Actions Layer */}
                <div className="grid grid-cols-2 gap-4 mt-auto relative z-10">
                    <a
                        href={tool.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        <span>Launch</span>
                        <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>

                    <button
                        className="group/price flex items-center justify-center gap-3 py-5 bg-white/5 border border-white/10 text-text-primary rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all duration-300"
                    >
                        <CreditCard size={16} className="text-primary group-hover/price:rotate-12 transition-transform" />
                        <span>Pricing</span>
                    </button>
                </div>

                {/* Visual Polish: Scanning line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent -translate-y-full group-hover:animate-scan" />
            </div>
        </motion.div>
    );
};

const AITools = () => {
    const tools = [
        {
            name: "Dissertation Assistant",
            description: "Advanced neural architecture optimized for complex academic research synthesis, structural logic, and bibliographic precision.",
            icon: GraduationCap,
            externalUrl: "https://anonemasid.netlify.app",
            status: "CALIBRATING",
            color: "bg-emerald-500",
            iconColor: "text-emerald-400",
            features: ["Research Synthesis", "Structure Analysis", "Citation Engine"]
        },
        {
            name: "Deck Architect",
            description: "High-impact visual strategy engine. Transform raw data into cinematic presentation narratives with intelligent flow.",
            icon: Presentation,
            externalUrl: "https://anonemasip.netlify.app",
            status: "DEPLOYING",
            color: "bg-blue-600",
            iconColor: "text-blue-400",
            features: ["Visual Hierarchy", "Narrative Flow", "Dynamic Layouts"]
        },
        {
            name: "Essay Catalyst",
            description: "Unlocking linguistic depth. Intelligent drafting protocols designed for creative resonance and rigorous analytical precision.",
            icon: PenTool,
            externalUrl: "https://anonemasie.netlify.app",
            status: "EVOLVING",
            color: "bg-purple-600",
            iconColor: "text-purple-400",
            features: ["Vocal Refinement", "Linguistic Flow", "Draft Protocols"]
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-32 bg-bg-main relative overflow-hidden selection:bg-primary/30">
            {/* Advanced Atmosphere Layer */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08)_0%,transparent_50%)] pointer-events-none" />
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[180px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            </div>

            <div className="container px-4 md:px-10 relative z-10">
                {/* Header Section */}
                <div className="max-w-5xl mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6 text-primary font-black uppercase tracking-[0.5em] text-[11px] mb-8"
                    >
                        <div className="w-16 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                        <Sparkles size={16} className="animate-pulse" />
                        <span>KWACHA DIGITAL INTELLIGENCE MATRIX</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-7xl md:text-9xl lg:text-[10rem] font-display font-[950] text-text-primary tracking-tighter leading-[0.8] mb-12"
                    >
                        AI <span className="text-primary italic relative">Research
                            <svg className="absolute -bottom-4 left-0 w-full h-4 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </span> <br />
                        Deployments
                    </motion.h1>

                    <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-xl md:text-2xl text-text-secondary font-medium max-w-2xl lowercase tracking-tight leading-relaxed opacity-50"
                        >
                            Proprietary neural environments engineered to redefine academic excellence and strategic visualization. Select a deployment to begin synchronization.
                        </motion.p>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col gap-2 p-6 glass rounded-[32px] border border-white/10"
                        >
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Global Compute Load</span>
                            <div className="flex gap-1">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [12, 24, 16, 20, 12] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Matrix Interface Stats bar */}
                <div className="flex flex-col xl:flex-row gap-8 items-stretch xl:items-center mb-24">
                    <div className="flex-1 glass-premium rounded-[32px] border border-white/10 p-2.5 flex items-center pr-8 shadow-2xl">
                        <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center text-primary border border-white/10 mr-6 group">
                            <BrainCircuit size={28} className="group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] block mb-1">Global Registry</span>
                            <input
                                type="text"
                                placeholder="Search deployment ID..."
                                className="bg-transparent border-none outline-none text-text-primary font-bold placeholder:text-text-muted/20 w-full text-lg"
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-2xl border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                            <Cpu size={14} className="animate-spin-slow" /> System Online
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass px-10 py-6 rounded-[32px] border border-white/10 flex items-center gap-6 group hover:border-primary/30 transition-all">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-surface-2 border-2 border-bg-main flex items-center justify-center text-[10px] font-black text-primary shadow-lg overflow-hidden relative">
                                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                                        {i * 12}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-display font-black text-text-primary tracking-tighter">450k+</span>
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Generations</span>
                            </div>
                        </div>
                        <button className="glass p-6 rounded-[32px] border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary group">
                            <History size={24} className="group-hover:-rotate-45 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Tools Grid - Premium Perspective */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32">
                    {tools.map((tool, i) => (
                        <ToolCard key={tool.name} tool={tool} index={i} />
                    ))}
                </div>

                {/* Intelligent Insights Footer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="p-16 glass-premium rounded-[80px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden group/footer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover/footer:opacity-100 transition-opacity duration-1000" />

                    <div className="flex items-center gap-10 relative z-10">
                        <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary shadow-2xl relative">
                            <div className="absolute inset-0 border-2 border-primary/20 rounded-[32px] animate-ping opacity-20" />
                            <Layers size={40} />
                        </div>
                        <div>
                            <h4 className="text-3xl font-display font-black text-text-primary tracking-tighter mb-3 uppercase italic">Neural <span className="text-primary italic">Consensus</span> 8.2</h4>
                            <p className="text-sm font-medium text-text-muted max-w-lg lowercase tracking-tight leading-relaxed">
                                our proprietary core is trained on over 500 million specialized datasets, ensuring every generation meets the highest standards of academic and visual integrity.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-6 relative z-10 w-full md:w-auto">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="flex flex-col items-end flex-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Matrix Synchronization</span>
                                <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 backdrop-blur-md">
                                    <motion.div
                                        animate={{ width: ["10%", "95%", "60%", "85%"] }}
                                        transition={{ duration: 15, repeat: Infinity }}
                                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                    />
                                </div>
                            </div>
                            <div className="w-20 h-20 glass rounded-[24px] flex items-center justify-center border border-white/10 text-primary shadow-2xl group-hover/footer:scale-110 transition-transform">
                                <Zap size={32} fill="currentColor" className="animate-pulse" />
                            </div>
                        </div>
                        <button className="w-full md:w-auto px-10 py-5 bg-white text-bg-main rounded-[20px] font-black uppercase tracking-[0.3em] text-[11px] hover:translate-y-[-4px] transition-all shadow-xl shadow-white/5 active:scale-95">
                            Connect Neural Uplink
                        </button>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(800px); }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default AITools;
