import React from 'react';
import { Youtube } from 'lucide-react';

const Music = () => {
    return (
        <div className="page-container flex-center">
            <h2 className="section-title">music</h2>

            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', maxWidth: '700px', textAlign: 'center', background: 'white', boxShadow: 'none' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#718096', lineHeight: '1.8' }}>
                    My hyper fixation during covid lockdowns was music production... you can be the judge of how that turned out
                </p>

                <a
                    href="https://www.youtube.com/@groovyKyle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', background: '#e53e3e', color: 'white', padding: '0.8rem 2rem', borderRadius: '50px', fontSize: '0.9rem' }}
                >
                    <Youtube size={20} />
                    visit groovykyle
                </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px', background: 'black' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/lpXh8Mjml1g"
                        title="YouTube video player 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px', background: 'black' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/XNjIxAyuzrI"
                        title="YouTube video player 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Music;
