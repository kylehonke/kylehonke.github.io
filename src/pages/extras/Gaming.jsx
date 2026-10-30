import { useEffect, useState } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import PageIntro from '../../components/PageIntro';
import MediaTile from '../../components/MediaTile';

const MEDIA = [1, 2, 3];

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const StatCard = ({ title, action, children }) => (
    <section className="stat-card glass-panel" aria-label={title}>
        <div className="stat-card-header">
            <h2>{title}</h2>
            {action}
        </div>
        {children}
    </section>
);

const ProfileLink = ({ href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="stat-link">
        view profile <ExternalLink size={16} aria-hidden="true" />
    </a>
);

const hideOnError = (e) => {
    e.currentTarget.style.display = 'none';
};

const SteamCard = ({ steam }) => (
    <StatCard title="steam" action={<ProfileLink href={steam?.profileUrl} />}>
        <ul className="stat-list steam-games">
            {steam?.games?.slice(0, 3).map(game => (
                <li key={game.name}>
                    {game.icon && <img src={game.icon} alt={game.name} width="48" height="48" />}
                    <div>
                        <p className="game-name">{game.name}</p>
                        <p className="stat-meta"><Clock size={14} aria-hidden="true" /> {Math.round(game.playtime_forever / 60)}h</p>
                    </div>
                </li>
            ))}
        </ul>
    </StatCard>
);

const XboxCard = ({ xbox }) => {
    const gamerscore = typeof xbox?.gamerscore === 'number' ? xbox.gamerscore.toLocaleString('en-US') : '---';
    const recentGames = xbox?.recentGames?.slice(0, 5) ?? [];

    return (
        <StatCard title="xbox" action={<span className="stat-tag">@{xbox?.gamertag || 'unknown'}</span>}>
            <div className="xbox-picture">
                {xbox?.gamerPictureUrl ? (
                    <img src={xbox.gamerPictureUrl} alt={`${xbox.gamertag || 'xbox'} gamer picture`} width="88" height="88" onError={hideOnError} />
                ) : (
                    <div className="xbox-picture-placeholder" />
                )}
            </div>

            <div className="stat-figure xbox-gamerscore">
                <p>{gamerscore}</p>
                <span>Gamerscore</span>
            </div>

            <p className="stat-label">Recent</p>
            <ul className="xbox-games">
                {recentGames.map(game => (
                    <li key={game.titleId ?? game.title} className="xbox-game">
                        <span className="bullet" aria-hidden="true"></span>
                        <span className="game-name">{game.title}</span>
                        <span className="stat-meta"><Clock size={12} aria-hidden="true" /> {game.playtimeHours}</span>
                    </li>
                ))}
                {recentGames.length === 0 && <li className="stat-empty">no recent titles</li>}
            </ul>
        </StatCard>
    );
};

const RetroCard = ({ retro }) => {
    const achievements = retro?.recentAchievements?.slice(0, 3) ?? [];

    return (
        <StatCard title="retro" action={<ProfileLink href={`https://retroachievements.org/user/${retro?.user}`} />}>
            <div className="stat-figures">
                <div className="stat-figure">
                    <p>{retro?.hardcorePoints ?? '---'}</p>
                    <span>hardcore points</span>
                </div>
                <div className="stat-figure">
                    <p>{retro?.softcorePoints ?? '---'}</p>
                    <span>softcore points</span>
                </div>
            </div>

            {retro?.lastGame && (
                <div className="retro-last-game">
                    <p className="stat-label">last played</p>
                    <p className="game-name">{retro.lastGame.title}</p>
                    <p className="console-name">{retro.lastGame.consoleName}</p>
                </div>
            )}

            <p className="stat-label">recent unlocks</p>
            {achievements.length > 0 ? (
                <ul className="stat-list retro-unlocks">
                    {achievements.map(achievement => (
                        <li key={`${achievement.game}-${achievement.title}`}>
                            <img src={achievement.badgeUrl} alt={achievement.title} width="48" height="48" onError={hideOnError} />
                            <div className="unlock-body">
                                <p className="unlock-title">{achievement.title}</p>
                                <p className="unlock-game">{achievement.game}</p>
                                <p className="stat-meta">
                                    {achievement.points} pts
                                    {achievement.hardcore && <span className="hardcore-badge" title="hardcore">HC</span>}
                                    <span className="unlock-date">{formatDate(achievement.dateAwarded)}</span>
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="stat-empty">no recent achievements</p>
            )}
        </StatCard>
    );
};

const Gaming = () => {
    const [stats, setStats] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        // no-cache revalidates with the server (cheap 304s) instead of always re-downloading.
        fetch('/stats.json', { cache: 'no-cache', signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setStats)
            .catch(err => {
                if (err.name === 'AbortError') return;
                console.error('Failed to load gaming stats:', err);
                setFailed(true);
            });
        return () => controller.abort();
    }, []);

    return (
        <div className="page-container flex-center">
            <PageIntro title="gaming" className="intro-panel--gaming">
                <p>
                    I&apos;ve been playing games as long as I&apos;ve been forming complete sentences. Some of my all-time favorites are Halo (3 &amp; Reach), Zelda (Ocarina of Time &amp; Majoras Mask), Fallout: New Vegas, and Clair Obscur: Expedition 33. See below for stats, platforms &amp; more!
                </p>
            </PageIntro>

            {stats ? (
                <div className="gaming-stats">
                    <div className="now-playing">
                        <h2>currently playing</h2>
                        <p>{stats.steam?.lastPlayed || 'Unknown'}</p>
                    </div>

                    <div className="stats-grid">
                        <SteamCard steam={stats.steam} />
                        <XboxCard xbox={stats.xbox} />
                        <RetroCard retro={stats.retro} />
                    </div>
                </div>
            ) : (
                <div className="gaming-status" role="status">
                    {failed ? 'couldn\'t load stats right now' : 'loading stats...'}
                </div>
            )}

            <h2 className="gaming-media-title">clips &amp; screenshots</h2>

            <div className="media-grid media-grid--clips">
                {MEDIA.map(n => (
                    <MediaTile key={n} type="video" src={`/assets/gaming/clips/clip-${n}.mp4`} fallback="clip missing" className="media-tile--clip" />
                ))}
            </div>

            <div className="media-grid">
                {MEDIA.map(n => (
                    <MediaTile key={n} src={`/assets/gaming/screenshots/screenshot-${n}.jpg`} alt={`Gaming screenshot ${n}`} fallback="Coming Soon!" className="media-tile--screenshot" />
                ))}
            </div>
        </div>
    );
};

export default Gaming;
