import React from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Clock,
    MousePointer2,
    ShoppingBag,
    Copy,
    CheckCircle,
    TrendingUp,
    Filter,
    Download,
    Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const stats = [
        { label: 'Total Earned', val: 'MK 23,400.00', icon: DollarSign, color: '#10b981' },
        { label: 'Pending Payout', val: 'MK 1,200.00', icon: Clock, color: '#f59e0b' },
        { label: 'Link Clicks', val: '1,240', icon: MousePointer2, color: '#3b82f6' },
        { label: 'Conversions', val: '47', icon: ShoppingBag, color: '#8b5cf6' },
    ];

    const copyLink = () => {
        navigator.clipboard.writeText('kwacha.mw/r/KD-X9T8Z');
        toast.success('Referral link copied!', {
            icon: <Copy size={16} />,
            style: {
                background: 'var(--text-1)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
            }
        });
    };

    return (
        <motion.div
            className="dashboard main"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
        >
            <div className="section-header">
                <div>
                    <h2 className="title">Marketer Dashboard</h2>
                    <p className="subtitle">Your referral performance at a glance</p>
                </div>
                <div className="dash-ref-wrap glass">
                    <span className="label">Your Ref ID</span>
                    <code className="ref-id">KD-X9T8Z</code>
                    <button className="btn btn--primary btn--sm" onClick={copyLink}>
                        <Copy size={14} /> Copy Link
                    </button>
                </div>
            </div>

            <div className="dash-stats grid grid--cols-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="dash-card shadow-md"
                        whileHover={{ y: -5 }}
                    >
                        <div className="dash-card-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={22} />
                        </div>
                        <div className="dash-card-info">
                            <div className="dash-card-label">{stat.label}</div>
                            <div className="dash-card-val">{stat.val}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="dash-table-wrap glass shadow-lg">
                <div className="table-header-row">
                    <h3 className="table-title"><Activity size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Commission History</h3>
                    <div className="table-actions">
                        <button className="btn btn--outline btn--sm"><Filter size={12} /> Filter</button>
                        <button className="btn btn--outline btn--sm"><Download size={12} /> Export</button>
                    </div>
                </div>
                <table className="dash-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Sale Amount</th>
                            <th>Your 10%</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { date: 'Feb 24, 2025', prod: 'Digital Marketing Africa', amt: 'MK 5,000', comm: 'MK 500', status: 'Paid' },
                            { date: 'Feb 22, 2025', prod: 'SME Funding Masterclass', amt: 'MK 8,500', comm: 'MK 850', status: 'Pending' },
                            { date: 'Feb 20, 2025', prod: 'Essay Writer Pro', amt: 'MK 4,500', comm: 'MK 450', status: 'Paid' },
                        ].map((row, i) => (
                            <tr key={i}>
                                <td>{row.date}</td>
                                <td><strong>{row.prod}</strong></td>
                                <td>{row.amt}</td>
                                <td>{row.comm}</td>
                                <td>
                                    <span className={`status-pill ${row.status.toLowerCase()}`}>
                                        {row.status === 'Paid' ? <CheckCircle size={10} style={{ marginRight: 4 }} /> : <Clock size={10} style={{ marginRight: 4 }} />}
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};


export default Dashboard;
