import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Users,
    TrendingUp,
    Calendar,
    Eye,
    CheckCircle,
    Video,
    DollarSign,
    Zap,
    Clock
} from 'lucide-react';
import { PRESENTATIONS, TICKER_ITEMS, CREATORS } from '../constants';

const YazamVault = () => {
    const [tickerItems, setTickerItems] = useState(TICKER_ITEMS);

    useEffect(() => {
        const interval = setInterval(() => {
            const newItem = {
                icon: <DollarSign size={14} />,
                name: `@User${Math.floor(Math.random() * 1000)} bought a presentation`,
                time: 'Just now · MK 4,500'
            };
            setTickerItems(prev => [newItem, ...prev.slice(0, 5)]);
        }, 5500);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="yazam-vault main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="layout">
                <div className="feed-col">
                    <div className="section-header">
                        <div>
                            <h2 className="title">Yazam Live <span className="badge-live">LIVE</span></h2>
                            <p className="subtitle">Ranked by most paid · Secure non-sharable file delivery</p>
                        </div>
                    </div>

                    <div className="pres-feed">
                        {PRESENTATIONS.map(pres => (
                            <motion.div
                                key={pres.id}
                                className="pres-card glass shadow-md"
                                whileHover={{ y: -4 }}
                            >
                                <div className="pres-thumb">
                                    <img className="pres-thumb-img" src={`https://picsum.photos/seed/pres${pres.id}/400/400`} alt={pres.name} />
                                    <div className="pres-thumb-overlay"></div>
                                    <div className="play-btn" style={{ background: pres.color, boxShadow: `0 8px 24px ${pres.color}66` }}>
                                        <Play fill="currentColor" size={24} />
                                    </div>
                                </div>
                                <div className="pres-content">
                                    <div className="pres-header">
                                        <span className="pres-cat">{pres.category}</span>
                                        <span className="pres-creator">{pres.creator} <CheckCircle size={10} style={{ display: 'inline', marginLeft: 2 }} /></span>
                                    </div>
                                    <h3 className="pres-title">{pres.name}</h3>
                                    <div className="pres-stats">
                                        <span><Users size={12} /> {pres.sales} sales</span>
                                        <span><Calendar size={12} /> {pres.date || 'Oct 2023'}</span>
                                    </div>
                                    <div className="pres-footer">
                                        <span className="pres-price">MK {pres.price}</span>
                                        <button className="btn btn--primary btn--sm">View Presentation</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <aside className="sidebar">
                    <div className="earn-banner">
                        <span className="emoji"><Zap size={24} /></span>
                        <div>
                            <div className="banner-title">Earn while you sleep</div>
                            <p>Share links — earn 10% commission on every sale.</p>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3><TrendingUp size={18} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} /> Top Creators</h3>
                        <div className="creators-list">
                            {CREATORS.map(creator => (
                                <div key={creator.id} className="creator-item">
                                    <div className="avatar-sm">{creator.name.split(' ').map(n => n[0]).join('')}</div>
                                    <div>
                                        <div className="name">{creator.name}</div>
                                        <div className="handle">{creator.handle}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="ticker-header">
                            <span className="pulse-dot"></span>
                            <span><Clock size={14} style={{ marginRight: 6 }} /> Live Sales Activity</span>
                        </div>
                        <div className="ticker-feed">
                            {tickerItems.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="ticker-item animate-in"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <span className="ticker-icon">{typeof item.icon === 'string' ? <DollarSign size={14} /> : item.icon}</span>
                                    <div>
                                        <div className="ticker-name" dangerouslySetInnerHTML={{ __html: item.name }}></div>
                                        <div className="ticker-time">{item.time}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
};


export default YazamVault;
