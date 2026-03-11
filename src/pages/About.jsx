import React from 'react';
import SocialIcons from '../components/SocialIcons';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="page-container flex-center" style={{ minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-3xl text-center"
            >
                <h2 className="section-title">about me</h2>

                <div className="glass-panel" style={{ padding: '3rem', marginBottom: '4rem', background: 'rgba(255,255,255,0.7)' }}>
                    <p style={{ fontSize: '1.1rem', color: '#4a5568', lineHeight: '1.9', marginBottom: '2rem', textAlign: 'center' }}>
                        Hello! I'm a Software Development Bachelor of Applied Science candidate expecting graduation in December 2026. 
                        My experience includes engineering machine learning and artificial intelligence applications using Python, TensorFlow, and serverless architectures. 
                        I am proficient in web development with React and Node, as well as version control and automation via Git and GitHub Actions. 
                        I possess a core foundation in C++, Java, data structures, and algorithms. 
                        I'm seeking internship opportunities to apply my technical background to the complex computational problems of tomorrow.
                    </p>
                    <div style={{ width: '40px', height: '2px', background: '#cbd5e0', margin: '0 auto 2rem' }}></div>
                    <p style={{ fontSize: '1.1rem', color: '#718096', fontWeight: '400', textAlign: 'center', textAlign: 'center' }}>
                        I'm always open to new connections, collaborations, projects and ideas, so please don't hesitate to reach out!
                    </p>
                </div>

                <div>
                    {/* This text removed for now, Icons increased size */}
                    <SocialIcons includeAll={true} size={32} />
                </div>
            </motion.div>
        </div>
    );
};

export default About;
