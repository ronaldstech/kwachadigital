import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    ShoppingBag,
    Video,
    Zap,
    TrendingUp,
    Users,
    Briefcase,
    Monitor,
    Smartphone,
    CheckCircle,
    Link as LinkIcon,
    Upload,
    Search,
    Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const [earning, setEarning] = useState(4500);
    const navigate = useNavigate();

    useEffect(() => {
        const earningInterval = setInterval(() => {
            const targets = [4500, 12800, 6300, 9200];
            setEarning(targets[Math.floor(Math.random() * targets.length)]);
        }, 6000);

        return () => {
            clearInterval(earningInterval);
        };
    }, []);

    return (
        <header className="hero">
            <div className="hero-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <motion.div
                className="hero-content"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="eyebrow">
                    <span className="flag">🇲🇼</span>
                    <span>Built for Africa's Digital Frontier</span>
                    <span className="pill">v2.0 Beta</span>
                </div>

                <h1 className="title">The Digital Economy<br /><em>Starts Here.</em></h1>
                <p className="subtitle">Buy, sell, and earn from Africa's most modern digital marketplace. Premium tools, live presentations, and an automated referral engine.</p>

                <div className="hero-search-wrapper">
                    <div className="hero-search">
                        <Search className="hero-search-icon" size={20} />
                        <input type="text" placeholder="Search apps, presentations, tools..." />
                        <span className="hero-search-kbd">
                            <Command size={12} />K
                        </span>
                    </div>
                </div>

                <div className="ctas">
                    <button className="btn btn--primary btn--lg" onClick={() => navigate('/marketplace')}>
                        <ShoppingBag size={20} />
                        Explore Marketplace
                    </button>
                    <button className="btn btn--outline btn--lg" onClick={() => navigate('/yazam')}>
                        <Video size={20} />
                        Browse Yazam
                    </button>
                </div>

                <div className="stats-row">
                    {[
                        { val: '320+', lbl: 'Apps Listed', icon: Smartphone },
                        { val: '1,200', lbl: 'Presentations', icon: Monitor },
                        { val: 'MK 2.4M', lbl: 'Paid to Creators', icon: Zap },
                        { val: '540+', lbl: 'Active Marketers', icon: Users },
                    ].map((stat, i) => (
                        <div key={i} className="stat">
                            <span className="stat-val">{stat.val}</span>
                            <span className="stat-lbl">{stat.lbl}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                className="hero-visual"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="dashboard-mockup">
                    <div className="browser-window">
                        <div className="browser-header">
                            <div className="browser-dots">
                                <div className="dot red"></div>
                                <div className="dot yellow"></div>
                                <div className="dot green"></div>
                            </div>
                            <div className="browser-url">kwachadigital.com/dashboard</div>
                        </div>
                        <div className="browser-body">
                            <div className="mock-dash-header">
                                <div className="mock-dash-title">Overview</div>
                                <div className="mock-dash-earnings">
                                    <div className="lbl">Total Earnings</div>
                                    <motion.div
                                        key={earning}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="val"
                                    >
                                        MK {earning.toLocaleString()}
                                    </motion.div>
                                    <div className="trend">↑ 15%</div>
                                </div>
                            </div>

                            <div className="mock-dash-grid">
                                <div className="mock-chart">
                                    <div className="mock-bar b1"></div>
                                    <div className="mock-bar b2"></div>
                                    <div className="mock-bar b3"></div>
                                    <div className="mock-bar b4"></div>
                                    <div className="mock-bar b5"></div>
                                    <div className="mock-bar b6"></div>
                                    <div className="mock-bar b7"></div>
                                </div>
                                <div className="mock-sales">
                                    {[
                                        { icon: Briefcase, color: 'var(--primary-pale)' },
                                        { icon: Monitor, color: '#e8f0fc' },
                                        { icon: Zap, color: 'var(--gold-pale)' }
                                    ].map((item, i) => (
                                        <div key={i} className="mock-sale-item">
                                            <div className="icon-box" style={{ background: item.color }}>
                                                <item.icon size={12} />
                                            </div>
                                            <div className="sale-lines">
                                                <div className="l1"></div>
                                                <div className="l2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <motion.div
                    className="float-card card-1 shadow-lg"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="icon-wrap" style={{ background: '#dbeafe', color: '#1d4ed8' }}><Users size={18} /></span>
                    <div>
                        <div className="name">Active Marketers</div>
                        <div className="meta">540+ online</div>
                    </div>
                </motion.div>
                <motion.div
                    className="float-card card-2 shadow-lg"
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <span className="icon-wrap" style={{ background: '#dcfce7', color: '#15803d' }}><TrendingUp size={18} /></span>
                    <div>
                        <div className="name">Sales Trending</div>
                        <div className="meta">↑ 34% this week</div>
                    </div>
                </motion.div>
                <motion.div
                    className="float-card card-3 shadow-lg"
                    animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <span className="icon-wrap" style={{ background: 'var(--primary)', color: 'white' }}><CheckCircle size={18} /></span>
                    <div>
                        <div className="name">New Signups</div>
                        <div className="meta">+12 today</div>
                    </div>
                </motion.div>
            </motion.div>

        </header>
    );
};

export default Hero;
