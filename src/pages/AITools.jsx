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
            className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-colors"
        >
            <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 ${tool.iconColor}`}>
                    <tool.icon size={28} />
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800/30 px-3 py-1 rounded-full border border-zinc-700/30">
                    {tool.status}
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                    {tool.name}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                    {tool.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-10">
                    {tool.features.map((feature, i) => (
                        <span key={i} className="text-[10px] font-semibold text-zinc-500 uppercase py-1 px-3 bg-zinc-800/40 rounded-lg border border-zinc-700/20">
                            {feature}
                        </span>
                    ))}
                </div>
            </div>

            <button
                onClick={handleLaunch}
                className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
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
        <div className="min-h-screen bg-black text-zinc-200 selection:bg-zinc-700">
            <div className="container max-w-7xl mx-auto px-6 pt-32 pb-24">
                
                {/* Simple Header */}
                <div className="mb-24">
                    <button 
                        onClick={() => navigate('/ai-tools')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-bold uppercase tracking-widest mb-12"
                    >
                        <ArrowLeft size={16} /> Back to Matrix
                    </button>

                    <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 italic">
                        AI <span className="text-zinc-500 not-italic">Deployments</span>
                    </h1>
                    
                    <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">
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
                <div className="border-t border-zinc-900 pt-16 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white uppercase tracking-tight">Neural Core 8.2</h4>
                            <p className="text-xs text-zinc-500">Trained on specialized academic datasets.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                            <Cpu size={14} /> System Stable
                        </div>
                        <button className="flex-1 md:flex-none px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all">
                            Neural Uplink
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITools;
