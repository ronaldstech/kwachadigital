import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Sparkles,
    GraduationCap,
    Presentation,
    PenTool,
    ArrowUpRight,
    ArrowLeft,
    Cpu,
    Layers,
    Zap
} from 'lucide-react';

const ToolCard = ({ tool, index }) => {
    const { user, openAuthModal } = useAuth();
    const navigate = useNavigate();

    const handleLaunch = (e) => {
        e.preventDefault();
        if (!user) {
            toast.info('Please login to access AI tools.', {
                icon: '🔒',
                style: {
                    background: '#18181b',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '13px',
                }
            });
            openAuthModal('login');
            return;
        }
        navigate(tool.link);
    };

    return (
        <div 
            className="flex flex-col bg-surface-2 border border-glass-border rounded-3xl p-8 hover:border-primary/30 transition-colors shadow-sm"
        >
            <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-bg-main border border-glass-border ${tool.iconColor}`}>
                    <tool.icon size={28} />
                </div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-1 px-3 py-1 rounded-full border border-glass-border">
                    {tool.status}
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {tool.name}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-8">
                    {tool.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-10">
                    {tool.features.map((feature, i) => (
                        <span key={i} className="text-[10px] font-semibold text-text-secondary uppercase py-1 px-3 bg-surface-1 rounded-lg border border-glass-border">
                            {feature}
                        </span>
                    ))}
                </div>
            </div>

            <button
                onClick={handleLaunch}
                className="w-full flex items-center justify-center gap-2 py-4 bg-text-primary hover:opacity-90 text-bg-main rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
            >
                Launch Project <ArrowUpRight size={16} />
            </button>
        </div>
    );
};

const AITools = () => {
    const navigate = useNavigate();
    const tools = [
        {
            name: "Dissertation Assistant",
            description: "Advanced architecture optimized for complex academic research synthesis and structural logic.",
            icon: GraduationCap,
            link: "/ai-tools/dissertation",
            status: "Online",
            iconColor: "text-emerald-400",
            features: ["Research", "Structure", "Citation"]
        },
        {
            name: "PowerPoint Presentation",
            description: "Transform raw data into cinematic narratives with intelligent visual flow.",
            icon: Presentation,
            link: "/ai-tools/powerpoint",
            status: "Online",
            iconColor: "text-blue-400",
            features: ["Visuals", "Narrative", "Layouts"]
        },
        {
            name: "Essay Catalyst",
            description: "Intelligent drafting protocols designed for creative resonance and analytical precision.",
            icon: PenTool,
            link: "/ai-tools/essay",
            status: "Online",
            iconColor: "text-purple-400",
            features: ["Vocal Refinement", "Linguistic Flow"]
        }
    ];

    return (
        <div className="min-h-screen bg-bg-main text-text-primary selection:bg-primary/20">
            <div className="container max-w-7xl mx-auto px-6 pt-32 pb-24">
                
                {/* Simple Header */}
                <div className="mb-24">
                    <button 
                        onClick={() => navigate('/ai-tools')}
                        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-12"
                    >
                        <ArrowLeft size={16} /> Back to Matrix
                    </button>

                    <h1 className="text-6xl md:text-8xl font-bold text-text-primary tracking-tighter mb-8 italic">
                        AI <span className="text-text-muted not-italic">Deployments</span>
                    </h1>
                    
                    <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                        Proprietary neural environments engineered to redefine academic excellence and strategic visualization.
                    </p>
                </div>

                {/* Clean Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {tools.map((tool, i) => (
                        <ToolCard key={tool.name} tool={tool} index={i} />
                    ))}
                </div>

                {/* Minimal Footer */}
                <div className="border-t border-glass-border pt-16 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-glass-border flex items-center justify-center text-text-muted">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-primary uppercase tracking-tight">Neural Core 8.2</h4>
                            <p className="text-xs text-text-muted">Trained on specialized academic datasets.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-xl border border-glass-border text-[10px] font-bold text-text-muted tracking-widest uppercase">
                            <Cpu size={14} /> System Stable
                        </div>
                        <button className="flex-1 md:flex-none px-8 py-4 bg-surface-2 hover:bg-surface-1 border border-glass-border text-text-primary rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all">
                            Neural Uplink
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITools;
