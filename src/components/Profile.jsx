import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    ShoppingBag,
    TrendingUp,
    Settings,
    Mail,
    Link as LinkIcon,
    Calendar,
    Shield,
    Edit,
    Camera,
    MapPin,
    CheckCircle,
    Share2,
    Phone,
    Layout,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const [activeSubTab, setActiveSubTab] = useState('overview');
    const { user } = useAuth();

    const stats = [
        { label: 'Followers', val: '1,240', icon: User },
        { label: 'Products', val: '12', icon: ShoppingBag },
        { label: 'Sales Made', val: '47', icon: CheckCircle },
        { label: 'Total Earned', val: 'MK 23,400', icon: TrendingUp },
    ];

    return (
        <motion.div
            className="profile main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="profile-banner glass shadow-lg">
                <div className="profile-info">
                    <div className="avatar-lg">
                        {user?.avatar || 'CK'}
                        <button className="avatar-edit"><Camera size={14} /></button>
                    </div>
                    <div className="profile-text">
                        <div className="name-row">
                            <h2 className="name">{user?.name || 'Chimwemwe Kachali'}</h2>
                            <span className="badge-verified"><Shield size={12} style={{ marginRight: 4 }} /> Verified</span>
                        </div>
                        <div className="handle">{user?.handle || '@chimwemwe_kd'}</div>
                        <p className="bio">Digital creator and marketer building premium assets for the African market. Specializing in educational tools and business templates.</p>
                        <div className="tags">
                            <span><MapPin size={12} /> Lilongwe, MW</span>
                            <span><Calendar size={12} /> Joined July 2023</span>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <button className="btn btn--outline btn--sm"><Edit size={14} /> Edit Profile</button>
                        <button className="btn btn--primary btn--sm"><Share2 size={14} /> Share</button>
                    </div>
                </div>
                <div className="profile-stats">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-stat">
                            <stat.icon size={16} className="p-icon" />
                            <span className="p-val">{stat.val}</span>
                            <span className="p-lbl">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="profile-tabs">
                {[
                    { id: 'overview', label: 'Overview', icon: Layout },
                    { id: 'products', label: 'Products', icon: ShoppingBag },
                    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
                    { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`p-tab ${activeSubTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveSubTab(tab.id)}
                    >
                        <tab.icon size={14} style={{ marginRight: 6 }} /> {tab.label}
                    </button>
                ))}
            </div>

            <motion.div
                className="profile-panel glass shadow-md"
                key={activeSubTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {activeSubTab === 'overview' && (
                    <div className="overview-content">
                        <div className="section">
                            <h3><Activity size={18} style={{ marginRight: 8 }} /> Recent Activity</h3>
                            <div className="activity-placeholder">
                                <FileText size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                                <p>No recent activity to show.</p>
                                <button className="btn btn--link btn--sm">Start creating</button>
                            </div>
                        </div>
                    </div>
                )}
                {activeSubTab === 'earnings' && (
                    <div className="earnings-content">
                        <h3>Payout Method</h3>
                        <div className="payout-method glass shadow-sm">
                            <div className="payout-icon"><Phone size={24} /></div>
                            <div>
                                <div className="method-name">Airtel Money</div>
                                <div className="method-detail">+265 99X XXX XXX</div>
                            </div>
                            <button className="btn btn--outline btn--sm" style={{ marginLeft: 'auto' }}>Change</button>
                        </div>
                        <div className="earnings-footer">
                            <div className="balance-info">
                                <span className="bal-lbl">Available Balance</span>
                                <span className="bal-val">MK 12,400</span>
                            </div>
                            <button className="btn btn--primary">Withdraw Funds</button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};


export default Profile;
