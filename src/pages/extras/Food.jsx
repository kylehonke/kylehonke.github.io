import React from 'react';
import restaurants from '../../data/restaurants.json';

const Food = () => {
    return (
        <div className="page-container">
            <h2 className="section-title">food</h2>

            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem', textAlign: 'center', background: 'white', boxShadow: 'none' }}>
                <p style={{ fontSize: '1.1rem', color: '#718096', lineHeight: '1.8' }}>
                    Because of course. My parents were in the restaurant industry, I spent many years in the service industry, and I've probably tried over 75% of the restaurants in Austin. Here's a few of my favorites if you live nearby, plus a few pics if you're into that sort of thing
                </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', maxWidth: '1000px', margin: '0 auto 6rem' }}>
                {restaurants.map(place => (
                    <div key={place.id} className="restaurant-card glass-panel" style={{ background: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', textAlign: 'left', flex: '1 1 300px', maxWidth: '400px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>{place.name}</h3>
                            <p style={{ color: '#718096', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1rem' }}>{place.description}</p>
                        </div>
                        <a href={place.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pastel-seafoam)', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-block', borderBottom: '2px solid transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--pastel-seafoam)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
                        >
                            visit website
                        </a>
                    </div>
                ))}
            </div>

            <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>gallery</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                {[1, 2, 3].map(n => (
                    <div key={n} style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#cbd5e0', background: '#e2e8f0' }}>
                        <img
                            src={`/assets/food/gallery/food-${n}.jpg`}
                            alt={`Food Gallery ${n}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerText = `food placeholder ${n}`;
                                e.target.parentElement.style.background = 'white';
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Food;
