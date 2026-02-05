import React from 'react';
import { Youtube } from 'lucide-react';

const Lego = () => {
    return (
        <div className="page-container flex-center">
            <h2 className="section-title">lego</h2>

            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', maxWidth: '700px', textAlign: 'center', background: 'white', boxShadow: 'none' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#718096' }}>
                    My most successful YouTube venture... and my most expensive hobby
                </p>

                <a
                    href="https://www.youtube.com/@groovybricks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', background: '#e53e3e', color: 'white', padding: '0.8rem 2rem', borderRadius: '50px', fontSize: '0.9rem' }}
                >
                    <Youtube size={20} />
                    explore groovybricks
                </a>
            </div>


        </div>
    );
};

export default Lego;
