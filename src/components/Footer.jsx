import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Twitter, Github, Linkedin, Mail, ExternalLink, Globe, Shield, Zap } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: 'Marketplace',
            links: [
                { name: 'Digital Products', path: '/marketplace' },
                { name: 'Expert Services', path: '/marketplace?type=services' },
                { name: 'Featured Items', path: '/marketplace?filter=featured' },
                { name: 'New Arrivals', path: '/marketplace?filter=new' },
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', path: '#' },
                { name: 'Success Stories', path: '#' },
                { name: 'Careers', path: '#' },
                { name: 'Privacy Policy', path: '#' },
            ]
        },
        {
            title: 'Support',
            links: [
                { name: 'Help Center', path: '#' },
                { name: 'Contact Support', path: '#' },
                { name: 'Community', path: '#' },
                { name: 'Status', path: '#' },
            ]
        }
    ];

    return (
        <footer className="relative pt-24 pb-12 overflow-hidden border-t border-glass-border bg-bg-main/30 backdrop-blur-3xl">
            {/* Background Depth Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    {/* Brand Identity */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link to="/" className="flex items-center gap-3 no-underline group w-fit">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary blur-md opacity-40 group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
                                    <Rocket size={24} className="text-white transform group-hover:rotate-12 transition-transform" />
                                </div>
                            </div>
                            <span className="text-2xl font-display font-black text-text-primary tracking-tighter">
                                Kwacha<span className="text-primary">.</span>Digital
                            </span>
                        </Link>

                        <p className="text-text-secondary text-lg leading-relaxed max-w-sm font-medium opacity-80">
                            The ultimate ecosystem for Malawian digital creators. Discover, trade, and scale your digital assets with enterprise-grade security.
                        </p>

                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, color: '#1DA1F2', label: 'Twitter' },
                                { icon: Github, color: '#f0f6fc', label: 'Github' },
                                { icon: Linkedin, color: '#0A66C2', label: 'LinkedIn' },
                                { icon: Mail, color: '#10b981', label: 'Email' }
                            ].map((social, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-text-secondary hover:text-white transition-all border-glass-border relative group shadow-xl"
                                    aria-label={social.label}
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                                    <social.icon size={20} className="relative z-10 transition-colors" />
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all blur-sm" style={{ backgroundColor: social.color }} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                        {footerSections.map((section) => (
                            <div key={section.title} className="space-y-6">
                                <h4 className="text-[12px] font-black uppercase tracking-[0.25em] text-text-primary/60">
                                    {section.title}
                                </h4>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                to={link.path}
                                                className="text-[15px] font-bold text-text-secondary hover:text-primary no-underline flex items-center gap-2 group transition-all"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                                                <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-10 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <p className="text-[13px] font-bold text-text-muted">
                            © {currentYear} Kwacha Digital. All systems operational.
                        </p>
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Exchange Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-[12px] font-black uppercase tracking-widest text-text-muted">
                        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group">
                            <Shield size={14} className="group-hover:text-primary transition-colors" />
                            <span>Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group">
                            <Globe size={14} className="group-hover:text-primary transition-colors" />
                            <span>Region: MW</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
