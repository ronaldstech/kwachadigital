import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Video,
    Activity,
    User,
    Upload,
    LogOut,
    ChevronDown,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();

    const navLinks = [
        { id: 'marketplace', label: 'Marketplace', path: '/marketplace', icon: LayoutGrid },
        { id: 'yazam', label: 'Yazam Vault', path: '/yazam', icon: Video },
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Activity },
    ];

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    return (
        <>
            <header className="nav-wrapper">
                <nav className="nav-container">
                    <div className="nav-content">
                        <div className="nav-left">
                            <button className="hamburger-menu" onClick={toggleDrawer}>
                                <Menu size={24} />
                            </button>
                            <Link to="/" className="logo">
                                <span>Kwacha<strong>Digital</strong></span>
                            </Link>
                        </div>

                        <div className="nav-right">
                            <div className="nav-links">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.id}
                                        to={link.path}
                                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                                    >
                                        <link.icon className="nav-icon" size={18} />
                                        <span>{link.label}</span>
                                    </NavLink>
                                ))}
                            </div>

                            <div className="nav-actions">
                                {user ? (
                                    <div className="user-menu">
                                        <div
                                            className="avatar"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            {user.avatar}
                                        </div>
                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="dropdown shadow-lg"
                                                    onMouseLeave={() => setIsDropdownOpen(false)}
                                                >
                                                    <div className="dd-header">
                                                        <div className="dd-avatar">{user.avatar}</div>
                                                        <div>
                                                            <div className="dd-name">{user.name}</div>
                                                            <div className="dd-role">{user.role}</div>
                                                        </div>
                                                    </div>
                                                    <div className="dd-divider"></div>
                                                    <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}>
                                                        <User size={14} style={{ marginRight: 8 }} /> My Profile
                                                    </button>
                                                    <button onClick={() => { navigate('/dashboard'); setIsDropdownOpen(false); }}>
                                                        <Activity size={14} style={{ marginRight: 8 }} /> Dashboard
                                                    </button>
                                                    <button onClick={() => { navigate('/upload'); setIsDropdownOpen(false); }}>
                                                        <Upload size={14} style={{ marginRight: 8 }} /> Upload Product
                                                    </button>
                                                    <div className="dd-divider"></div>
                                                    <button className="dd-danger" onClick={() => { logout(); setIsDropdownOpen(false); }}>
                                                        <LogOut size={14} style={{ marginRight: 8 }} /> Sign Out
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <button className="btn btn--outline btn--sm sign-in-btn" onClick={() => navigate('/login')}>
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>


            {/* Mobile Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="drawer-overlay"
                            onClick={toggleDrawer}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="mobile-drawer"
                        >
                            <div className="drawer-header">
                                <div className="logo">
                                    <div className="logo-mark">₭</div>
                                    <span>Kwacha<strong>Digital</strong></span>
                                </div>
                                <button className="close-btn" onClick={toggleDrawer}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="drawer-content">
                                {user && (
                                    <div className="drawer-user">
                                        <div className="dd-avatar">{user.avatar}</div>
                                        <div>
                                            <div className="dd-name">{user.name}</div>
                                            <div className="dd-role">{user.role}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="drawer-links">
                                    {navLinks.map((link) => (
                                        <NavLink
                                            key={link.id}
                                            to={link.path}
                                            className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}
                                            onClick={toggleDrawer}
                                        >
                                            <link.icon size={20} />
                                            {link.label}
                                        </NavLink>
                                    ))}
                                </div>

                                <div className="drawer-divider"></div>

                                <div className="drawer-actions">
                                    <button
                                        className="drawer-link"
                                        onClick={() => { navigate('/upload'); toggleDrawer(); }}
                                    >
                                        <Upload size={20} />
                                        List Product
                                    </button>
                                    {user ? (
                                        <>
                                            <button
                                                className="drawer-link"
                                                onClick={() => { navigate('/profile'); toggleDrawer(); }}
                                            >
                                                <User size={20} />
                                                My Profile
                                            </button>
                                            <button
                                                className="drawer-link logout"
                                                onClick={() => { logout(); toggleDrawer(); }}
                                            >
                                                <LogOut size={20} />
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn btn--primary w-full"
                                            onClick={() => { navigate('/login'); toggleDrawer(); }}
                                        >
                                            Sign In
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
