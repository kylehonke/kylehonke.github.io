import React, { useState } from 'react';
import SocialIcons from '../components/SocialIcons';
import MouseTrail from '../components/MouseTrail';
import { motion } from 'framer-motion';
import '../styles/pages.css';

const Home = () => {
    return (
        <div className="home-container">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="home-title"
                style={{ color: 'var(--text-color)', textShadow: 'none' }}
            >
                hi, i'm kyle
            </motion.h1>

            <div className="home-subtitle">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{ color: 'var(--text-light)', letterSpacing: '1px', textTransform: 'lowercase' }}
                >
                    welcome to my website :)
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
            >
                <SocialIcons />
            </motion.div>

            <MouseTrail />
        </div>
    );
};

export default Home;
