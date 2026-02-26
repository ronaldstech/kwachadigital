import React from 'react';
import { motion } from 'framer-motion';

const SystemLoader = () => {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-bg-main overflow-hidden">
            {/* Ambient Background Elements */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                className="absolute inset-0"
            >
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-emerald-500/10 blur-[150px] rounded-full" />
            </motion.div>

            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <div className="relative mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="w-24 h-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative z-10 box-shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-[32px] border-2 border-primary/40 border-t-transparent"
                        />
                        <span className="text-3xl font-display font-black tracking-tighter italic">KD</span>
                    </motion.div>

                    {/* Ring Accents */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 -m-4 border border-primary/10 rounded-[40px]"
                    />
                </div>

                {/* Loading Text */}
                <div className="text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl font-display font-black text-text-primary tracking-[0.1em] uppercase italic mb-2"
                    >
                        Initializing <span className="text-primary">System</span>
                    </motion.h2>
                    <div className="flex justify-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-[-100px] text-[10px] font-black uppercase tracking-[0.4em] text-text-muted whitespace-nowrap"
                >
                    Kwacha Digital · Secure Node Connection
                </motion.p>
            </div>
        </div>
    );
};

export default SystemLoader;
