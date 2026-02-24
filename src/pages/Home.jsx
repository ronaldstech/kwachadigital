import React from 'react';
import Hero from '../components/Hero';
import Marketplace from '../components/Marketplace';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Hero />
            <div className="main">
                <div className="section-divider">
                    <span className="divider-line"></span>
                    <span className="divider-text">Featured in Marketplace</span>
                    <span className="divider-line"></span>
                </div>
                <Marketplace />
            </div>
        </motion.div>
    );
};

export default Home;
