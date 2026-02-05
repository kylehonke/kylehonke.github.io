import React from 'react';

const Storm = () => {
    // Generate array [1, ... 18]
    const images = Array.from({ length: 18 }, (_, i) => i + 1);

    return (
        <div className="page-container flex-center">
            <h2 className="section-title">storm</h2>

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '700px', marginBottom: '3rem', textAlign: 'center', boxShadow: 'none', background: 'white' }}>
                <p style={{ fontSize: '1.1rem', color: '#718096', lineHeight: '1.8' }}>
                    Storm Kitty Flacko Jodye (or just 'Storm' for short) is my fluffy grey best friend. He was born in March 2020, making him a covid kitty with no respect for personal space. This space is just for him
                </p>
            </div>

            <div className="storm-gallery" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {images.map((i) => (
                    <div key={i} className="gallery-item" style={{ borderRadius: '12px', overflow: 'hidden', height: '300px', background: '#f7fafc', position: 'relative' }}>
                        {/* 
                           User Instruction: 
                           Place images in public/assets/storm/ named storm-1.jpg, storm-2.jpg, etc.
                           Extensions can vary, but hardcoding .jpg for simplicity. 
                           If user uses png, they might need to update this or I can provide a script to detect.
                           For now, asking for jpg is easiest.
                        */}
                        <img
                            src={`/assets/storm/storm-${i}.jpg`}
                            alt={`Storm ${i}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://placehold.co/400x400?text=storm-${i}`; // Fallback if local image missing
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Storm;
