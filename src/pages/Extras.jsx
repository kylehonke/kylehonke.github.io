import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Cat, Box, Music, Pizza } from 'lucide-react';
import { motion } from 'framer-motion';

const Extras = () => {
    const extras = [
        { name: 'gaming', icon: Gamepad2, path: '/extras/gaming' },
        { name: 'storm', icon: Cat, path: '/extras/storm' },
        { name: 'lego', icon: Box, path: '/extras/lego' },
        { name: 'music', icon: Music, path: '/extras/music' },
        { name: 'food', icon: Pizza, path: '/extras/food' },
    ];

    return (
        <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
            <div className="extras-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '600px' }}>
                {extras.map((item, index) => (
                    <Link to={item.path} key={item.name} style={{ textDecoration: 'none' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="extras-item"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.paddingLeft = '2.5rem';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.paddingLeft = '1.5rem';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <item.icon size={28} color="#718096" />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '400', margin: 0, color: '#4a5568' }}>{item.name}</h3>
                            </div>
                            <span style={{ color: 'white', fontSize: '0.9rem' }}>{item.desc}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Extras;
