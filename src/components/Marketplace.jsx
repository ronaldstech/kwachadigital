import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Zap,
    Star,
    Download,
    ChevronRight,
    ChevronLeft,
    Flame,
    Sparkles,
    PieChart,
    Edit3,
    Cpu,
    Video
} from 'lucide-react';
import { SERVICES, PRESENTATIONS } from '../constants';

const Marketplace = () => {
    const [filter, setFilter] = useState('all');
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [carouselCat, setCarouselCat] = useState('presentations');

    const filteredServices = filter === 'all'
        ? SERVICES
        : SERVICES.filter(s => s.category === filter);

    const carouselItems = carouselCat === 'presentations' ? PRESENTATIONS : SERVICES;

    useEffect(() => {
        const timer = setInterval(() => {
            setCarouselIdx(prev => (prev + 1) % carouselItems.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [carouselItems.length]);

    const getIcon = (name) => {
        if (name.includes('Essay')) return <Edit3 size={20} />;
        if (name.includes('AI') || name.includes('Course')) return <Cpu size={20} />;
        if (name.includes('Biz') || name.includes('Deck')) return <PieChart size={20} />;
        return <Zap size={20} />;
    };

    return (
        <div className="marketplace">
            <section className="whats-new">
                <div className="section-content">
                    <div className="wn-header">
                        <div className="wn-label">
                            <span className="wn-pulse"></span>
                            <span>What's New</span>
                        </div>
                        <div className="wn-cats">
                            <button
                                className={`wn-cat ${carouselCat === 'presentations' ? 'active' : ''}`}
                                onClick={() => { setCarouselCat('presentations'); setCarouselIdx(0); }}
                            >
                                <Video size={14} style={{ marginRight: 6 }} /> Hot Presentations
                            </button>
                            <button
                                className={`wn-cat ${carouselCat === 'services' ? 'active' : ''}`}
                                onClick={() => { setCarouselCat('services'); setCarouselIdx(0); }}
                            >
                                <Zap size={14} style={{ marginRight: 6 }} /> Hot Services
                            </button>
                        </div>
                    </div>

                    <div className="wn-carousel">
                        <motion.div
                            className="wn-track"
                            animate={{ x: -(carouselIdx * (280 + 20)) }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {carouselItems.map((item, i) => (
                                <div key={i} className="wn-card">
                                    <div className="wn-cover">
                                        <img className="wn-cover-img" src={`https://picsum.photos/seed/wn${item.id}/600/400`} alt={item.name} />
                                        <div className="wn-cover-overlay"></div>
                                        {item.trending && <div className="ribbon"><Flame size={10} /> Trending</div>}
                                        {item.new && <div className="ribbon gold"><Sparkles size={10} /> New</div>}
                                        <div className="thumb" style={{ background: item.color, boxShadow: `0 8px 20px ${item.color}33` }}>
                                            {getIcon(item.name)}
                                        </div>
                                    </div>
                                    <div className="wn-body">
                                        <div className="cat">{item.category}</div>
                                        <div className="name">{item.name}</div>
                                        <div className="creator">{item.creator || `${item.users} users`}</div>
                                        <div className="card-meta">
                                            <span>{item.sales ? <><Download size={12} /> {item.sales} sales</> : <><Star size={12} /> {item.rating} rating</>}</span>
                                            <span className="price">MK {item.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        <button className="wn-arrow prev" onClick={() => setCarouselIdx(prev => (prev - 1 + carouselItems.length) % carouselItems.length)}><ChevronLeft size={20} /></button>
                        <button className="wn-arrow next" onClick={() => setCarouselIdx(prev => (prev + 1) % carouselItems.length)}><ChevronRight size={20} /></button>
                    </div>
                </div>
            </section>

            <section className="services">
                <div className="section-header">
                    <div>
                        <h2 className="title">Digital Services</h2>
                        <p className="subtitle">Ranked by most subscribed · Auto-updates after each purchase</p>
                    </div>
                    <div className="filter-bar">
                        {['all', 'writing', 'tools', 'finance'].map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat === 'all' ? <Filter size={12} style={{ marginRight: 4 }} /> : null}
                                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div
                    className="services-grid grid grid--cols-4"
                    layout
                >
                    <AnimatePresence>
                        {filteredServices.map(svc => (
                            <motion.div
                                key={svc.id}
                                className="svc-card shadow-md"
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="svc-cover">
                                    <img className="svc-cover-img" src={`https://picsum.photos/seed/svc${svc.id}/600/400`} alt={svc.name} />
                                    <div className="svc-cover-overlay"></div>
                                    <div className="svc-icon" style={{ background: svc.color, color: 'white', boxShadow: `0 8px 24px ${svc.color}66` }}>
                                        {getIcon(svc.name)}
                                    </div>
                                    <div className="svc-cat-badge">{svc.category}</div>
                                </div>
                                <div className="svc-body">
                                    <h3 className="svc-name">{svc.name}</h3>
                                    <div className="svc-meta">
                                        <span><Download size={12} /> {svc.users} active</span>
                                        <span className="dot-sep">•</span>
                                        <span><Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> {svc.rating}</span>
                                    </div>
                                    <div className="svc-footer">
                                        <div className="svc-price-box">
                                            <span className="svc-price">MK {svc.price}</span>
                                            <span className="svc-period">/mo</span>
                                        </div>
                                        <button className="btn btn--primary btn--sm svc-btn">Subscribe</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </section>
        </div>
    );
};


export default Marketplace;
