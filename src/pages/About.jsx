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
                    <div style={{ fontSize: '1.1rem', color: '#4a5568', lineHeight: '1.9', textAlign: 'center' }}>
                        <p style={{ marginBottom: '2rem' }}>
                            Hi! I'm Kyle, a software developer and Software Development BAS student at ACC, graduating in December 2026. I'm currently a Software Developer at Clozure, where I'm gaining hands-on experience developing software as part of an exceptional engineering team.
                        </p>

                        <p style={{ marginBottom: '2rem' }}>
                            My interests extend across software engineering, machine learning, and data science. I've worked with machine learning and AI systems from the data and modeling side as well as the software side, and I enjoy the challenge of taking an idea from an algorithm or prototype and turning it into something that can actually be used.
                        </p>

                        <p style={{ marginBottom: '2rem' }}>
                            I tend to gravitate toward difficult problems and projects where there's something new to figure out. Whether I'm learning a new technology, working through an unfamiliar codebase, or building something from scratch, I care about understanding how things work rather than simply getting them to work once.
                        </p>
                    </div>

                    <div style={{ width: '40px', height: '2px', background: '#cbd5e0', margin: '0 auto 2rem' }}></div>

                    <p style={{ fontSize: '1.1rem', color: '#718096', fontWeight: '400', textAlign: 'center' }}>
                        I'm always open to new connections, collaborations, projects and ideas, so please don't hesitate to reach out!
                    </p>
                </div>

                <div>
                    {/*text removed for now, Icons increased size. Note - Icons currently cut off on mobile devices */}
                    <SocialIcons includeAll={true} size={32} />
                </div>
            </motion.div>
        </div>
    );
};

export default About;
