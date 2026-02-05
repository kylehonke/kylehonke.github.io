import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink } from 'lucide-react';

const Gaming = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('/stats.json')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to load gaming stats:', err));
    }, []);

    return (
        <div className="page-container flex-center">
            <h2 className="section-title">gaming</h2>

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', marginBottom: '4rem', textAlign: 'center', boxShadow: 'none', background: 'white' }}>
                <p style={{ fontSize: '1.1rem', color: '#718096', lineHeight: '1.8' }}>
                    I've been playing games as long as I've been forming complete sentences. Some of my all-time favorites are Halo: 3, Halo: Reach, Zelda: Ocarina of Time, Zelda: Majoras Mask, Fallout: New Vegas, and Clair Obscur: Expedition 33. You can see some of my stats below (assuming everything's working properly) or add me for a future play sesh!
                </p>
            </div>

            {stats ? (
                <div style={{ width: '100%', marginBottom: '5rem', maxWidth: '1000px' }}>
                    {/* Currently Playing */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem', background: 'rgba(255,255,255,0.6)', padding: '2rem', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '1rem', color: '#a0aec0', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>currently playing</h3>
                        <p style={{ fontSize: '2rem', color: '#4a5568', fontWeight: 'bold' }}>{stats.steam?.lastPlayed || "Unknown"}</p>
                    </div>

                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        {/* Steam */}
                        <div className="stat-card glass-panel" style={{ textAlign: 'left', background: 'white', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#2d3748' }}>steam</h3>
                                <a
                                    href={stats.steam?.profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--pastel-seafoam)', fontWeight: 'bold', fontSize: '0.9rem' }}
                                >
                                    view profile <ExternalLink size={16} />
                                </a>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {stats.steam?.games?.slice(0, 3).map((game, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                                        {game.icon && <img src={game.icon} alt={game.name} style={{ width: '48px', height: '48px', borderRadius: '8px', opacity: 0.9 }} />}
                                        <div>
                                            <p style={{ fontWeight: '600', fontSize: '1rem', color: '#4a5568' }}>{game.name}</p>
                                            <p style={{ fontSize: '0.9rem', color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {Math.round(game.playtime_forever / 60)}h</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Xbox */}
                        <div className="stat-card glass-panel" style={{ textAlign: 'left', background: 'white', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#2d3748' }}>xbox</h3>
                                <span style={{ color: '#a0aec0', fontSize: '0.9rem', fontWeight: '500', background: '#f7fafc', padding: '4px 8px', borderRadius: '4px' }}>@{stats.xbox?.gamertag}</span>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4a5568', lineHeight: '1' }}>{stats.xbox?.gamerscore}</p>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#a0aec0' }}>Gamerscore</span>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent</p>
                                <ul style={{ paddingLeft: '0', fontSize: '1rem', color: '#718096' }}>
                                    {stats.xbox?.recentGames?.map((g, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--pastel-seafoam)', borderRadius: '50%', display: 'inline-block' }}></span>
                                            {g}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Retro */}
                        <div className="stat-card glass-panel" style={{ textAlign: 'left', background: 'white', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#2d3748' }}>retro</h3>
                                <a
                                    href={`https://retroachievements.org/user/${stats.retro?.user}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--pastel-seafoam)', fontWeight: 'bold', fontSize: '0.9rem' }}
                                >
                                    view profile <ExternalLink size={16} />
                                </a>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4a5568', lineHeight: '1' }}>{stats.retro?.points}</p>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#a0aec0' }}>Hardcore Points</span>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latest Unlock</p>
                            {stats.retro?.recentAchievements?.[0] && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #edf2f7' }}>
                                    <p style={{ fontWeight: '600', fontSize: '1rem', color: '#2d3748', marginBottom: '0.2rem' }}>{stats.retro.recentAchievements[0].title}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#718096' }}>{stats.retro.recentAchievements[0].game}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '5rem', color: '#a0aec0' }}>loading stats...</div>
            )}

            {/* Clips Section */}
            <h3 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '2rem', color: '#4a5568' }}>clips & screenshots</h3>

            {/* 3 Clips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', marginBottom: '4rem' }}>
                {[1, 2, 3].map(n => (
                    <div key={`clip-${n}`} style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#a0aec0', background: 'black', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <video
                            width="100%"
                            height="100%"
                            controls
                            preload="metadata"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span style="color:white; opacity:0.5;">clip missing</span>';
                            }}
                        >
                            <source src={`/assets/gaming/clips/clip-${n}.mp4`} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ))}
            </div>

            {/* 3 Screenshots */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
                {[1, 2, 3].map(n => (
                    <div key={`shot-${n}`} style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#a0aec0', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                        <img
                            src={`/assets/gaming/screenshots/screenshot-${n}.jpg`}
                            alt={`Screenshot ${n}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerText = 'screenshot missing';
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gaming;
