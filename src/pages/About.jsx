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
                        I'm a Software Development BAS candidate at ACC with a focused passion for bridging the gap between vigorous software engineering and advanced Machine Learning. My background is rooted in building end-to-end Python pipelines, where I leverage TensorFlow and PyTorch to develop neural networks, time-series forecasting, and regression models.
                        Beyond the world of data science, I have a strong foundation in systems-level programming with C++ and Java. I thrive on the challenge of implementing complex data structures and algorithms, always adhering to clean Object-Oriented Programming (OOP) principles to ensure my code is as scalable as it is efficient.
                        Whether I'm optimizing an LSTM model or architecting a responsive web app, my goal is to build intelligent systems that solve real-world problems. I'm constantly exploring the future of human-machine relationships and the technical nuances that make software truly impactful.
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
