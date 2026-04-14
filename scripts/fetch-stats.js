import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ES MODULE FIX START ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- ES MODULE FIX END ---

// Env variables
const STEAM_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID;
const XBOX_KEY = process.env.XBOX_API_KEY;
const XBOX_GAMERTAG = process.env.XBOX_GAMERTAG || 'grooovyKyle';
const RETRO_KEY = process.env.RETRO_API_KEY;
const RETRO_USER = process.env.RETRO_USER;

const OUTPUT_FILE = path.join(__dirname, '../public/stats.json');
const XBOX_RECENT_TITLE_LIMIT = 5;

function readExistingStats() {
    try {
        if (!fs.existsSync(OUTPUT_FILE)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch (e) {
        console.warn('Could not read existing stats.json, continuing with fresh data.');
        return null;
    }
}

function unwrapApiResponse(payload) {
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'content')) {
        return payload.content;
    }
    return payload;
}

function getSettingValue(settings, ids) {
    if (!Array.isArray(settings)) {
        return null;
    }

    for (const id of ids) {
        const setting = settings.find(s => s?.id === id);
        if (setting?.value) {
            return setting.value;
        }
    }

    return null;
}

function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value.replace(/[^0-9.-]/g, ''));
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

function toHoursLabel(minutes) {
    const safeMinutes = toNumber(minutes, 0);

    if (safeMinutes <= 0) {
        return '0h';
    }

    if (safeMinutes < 60) {
        return '<1h';
    }

    return `${Math.round(safeMinutes / 60)}h`;
}

function parsePlaytimeMinutes(title) {
    const candidates = [
        title?.stats?.minutesPlayed,
        title?.stats?.MinutesPlayed,
        title?.stats?.playtimeMinutes,
        title?.detail?.stats?.minutesPlayed,
        title?.playtimeMinutes,
        title?.playTimeMinutes,
        title?.playtime,
        title?.timePlayed,
        title?.timePlayedMinutes,
        title?.minutesPlayed,
        title?.titleHistory?.minutesPlayed
    ];

    for (const candidate of candidates) {
        if (candidate !== undefined && candidate !== null && candidate !== '') {
            return Math.max(0, toNumber(candidate, 0));
        }
    }

    return 0;
}

function parseLastPlayed(title) {
    return (
        title?.titleHistory?.lastTimePlayed ||
        title?.lastTimePlayed ||
        title?.lastPlayed ||
        title?.history?.lastPlayed ||
        null
    );
}

function normalizeRecentXboxGames(rawTitles, limit = XBOX_RECENT_TITLE_LIMIT) {
    if (!Array.isArray(rawTitles)) {
        return [];
    }

    const normalized = rawTitles
        .map(title => {
            const playtimeMinutes = parsePlaytimeMinutes(title);

            return {
                title: title?.name || title?.titleName || title?.title || 'Unknown Title',
                titleId: title?.titleId ?? title?.id ?? null,
                playtimeMinutes,
                playtimeHours: toHoursLabel(playtimeMinutes),
                lastPlayed: parseLastPlayed(title),
                imageUrl: title?.displayImage || title?.displayImageUrl || title?.image || null
            };
        })
        .filter(game => game.title && game.title !== 'Unknown Title')
        .sort((a, b) => {
            const aTime = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
            const bTime = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
            return bTime - aTime;
        })
        .slice(0, limit);

    return normalized;
}

function mergeXboxData(nextXbox, fallbackXbox) {
    if (!nextXbox) {
        return fallbackXbox || null;
    }

    if (!fallbackXbox) {
        return nextXbox;
    }

    return {
        ...fallbackXbox,
        ...nextXbox,
        gamerscore: nextXbox.gamerscore ?? fallbackXbox.gamerscore ?? 0,
        gamerPictureUrl: nextXbox.gamerPictureUrl || fallbackXbox.gamerPictureUrl || null,
        recentGames: (Array.isArray(nextXbox.recentGames) && nextXbox.recentGames.length > 0)
            ? nextXbox.recentGames
            : (fallbackXbox.recentGames || [])
    };
}

async function fetchXboxJson(pathname) {
    const endpoints = [
        `https://api.xbl.io${pathname}`,
        `https://xbl.io/api${pathname}`
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                headers: { 'X-Authorization': XBOX_KEY, 'Accept': 'application/json' }
            });

            if (!response.ok) {
                continue;
            }

            const payload = await response.json();
            return unwrapApiResponse(payload);
        } catch (e) {
            console.warn(`Xbox request failed for ${endpoint}`);
        }
    }

    return null;
}

async function fetchXboxTitles(xuid) {
    const pathCandidates = ['/v2/titles'];

    if (xuid) {
        pathCandidates.push(`/v2/titles/${xuid}`);
    }

    pathCandidates.push('/v2/player/titleHistory');

    if (xuid) {
        pathCandidates.push(`/v2/player/titleHistory/${xuid}`);
    }

    for (const pathCandidate of pathCandidates) {
        const data = await fetchXboxJson(pathCandidate);

        if (!data) {
            continue;
        }

        if (Array.isArray(data.titles)) {
            return data.titles;
        }

        if (Array.isArray(data)) {
            return data;
        }
    }

    return [];
}

async function fetchSteamStats() {
    if (!STEAM_KEY || !STEAM_ID) {
        console.warn("Steam env vars missing"); 
        return null;
    }
    try {
        // CHANGED TO HTTPS HERE:
        const ownedRes = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json&include_appinfo=1&include_played_free_games=1`);
        const ownedData = await ownedRes.json();
        const games = ownedData.response.games || [];

        games.sort((a, b) => b.playtime_forever - a.playtime_forever);

        // CHANGED TO HTTPS HERE:
        const profileRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
        const profileData = await profileRes.json();
        const profile = profileData.response.players[0];

        // CHANGED TO HTTPS HERE:
        const recentRes = await fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json`);
        const recentData = await recentRes.json();

        return {
            profileUrl: profile?.profileurl,
            avatar: profile?.avatarfull,
            games: games.slice(0, 10).map(g => ({
                name: g.name,
                playtime_forever: g.playtime_forever,
                // Steam CDN supports HTTP/HTTPS, keeping generic or forcing HTTPS is fine
                icon: `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
            })),
            lastPlayed: recentData.response.games?.[0]?.name || games[0]?.name
        };
    } catch (e) {
        console.error('Steam Fetch Error occurred (details hidden for security).');
        return null;
    }
}

async function fetchXboxStats(previousXbox = null) {
    if (!XBOX_KEY) {
        console.warn('Xbox env var missing');
        return previousXbox || null;
    }

    try {
        const accountData = await fetchXboxJson('/v2/account');

        if (!accountData) {
            throw new Error('Could not fetch Xbox account data.');
        }

        const profileUser = accountData.profileUsers?.[0] || accountData?.people?.[0] || {};
        const settings = profileUser?.settings || [];

        const xuid = profileUser?.id || profileUser?.hostId || accountData?.xuid || previousXbox?.xuid || null;
        const gamertag =
            getSettingValue(settings, ['Gamertag', 'ModernGamertag']) ||
            accountData?.gamertag ||
            previousXbox?.gamertag ||
            XBOX_GAMERTAG;
        const gamerscore = toNumber(
            getSettingValue(settings, ['Gamerscore', 'GamerScore']) ?? accountData?.gamerscore ?? previousXbox?.gamerscore ?? 0,
            0
        );
        const gamerPictureUrl =
            getSettingValue(settings, ['GameDisplayPicRaw', 'PublicGamerpic', 'GameDisplayPic']) ||
            accountData?.profilePicture ||
            previousXbox?.gamerPictureUrl ||
            null;

        const titles = await fetchXboxTitles(xuid);
        const normalizedXbox = {
            xuid,
            gamertag,
            gamerscore,
            gamerPictureUrl,
            recentGames: normalizeRecentXboxGames(titles, XBOX_RECENT_TITLE_LIMIT),
            fromCache: false,
            lastFetchedAt: new Date().toISOString()
        };

        return mergeXboxData(normalizedXbox, previousXbox);
    } catch (e) {
        console.error('Xbox Fetch Error occurred (details hidden for security).');

        if (previousXbox) {
            return {
                ...previousXbox,
                fromCache: true,
                lastFetchedAt: new Date().toISOString()
            };
        }

        return null;
    }
}

async function fetchRetroStats() {
    if (!RETRO_KEY || !RETRO_USER) {
        console.warn("Retro env vars missing");
        return null;
    }
    try {
        const res = await fetch(`https://retroachievements.org/API/API_GetUserSummary.php?z=${RETRO_USER}&y=${RETRO_KEY}&u=${RETRO_USER}&g=3&a=10`);
        const data = await res.json();

        return {
            user: RETRO_USER,
            hardcorePoints: data.TotalPoints,
            softcorePoints: data.TotalSoftcorePoints,
            lastGame: data.LastGame ? {
                title: data.LastGame.Title,
                consoleName: data.LastGame.ConsoleName,
                icon: data.LastGame.ImageIcon?.startsWith('http')
                    ? data.LastGame.ImageIcon
                    : `https://media.retroachievements.org${data.LastGame.ImageIcon}`
            } : null,
            recentAchievements: data.RecentAchievements
                ? Object.values(data.RecentAchievements)
                      .flatMap(gameObj => Object.values(gameObj))
                      .sort((a, b) => new Date(b.DateAwarded) - new Date(a.DateAwarded))
                      .slice(0, 5)
                      .map(a => ({
                          title: a.Title,
                          game: a.GameTitle,
                          points: a.Points,
                          dateAwarded: a.DateAwarded,
                          badgeUrl: `https://media.retroachievements.org/Badge/${a.BadgeName}.png`,
                          hardcore: a.HardcoreAchieved === 1
                      }))
                : []
        };
    } catch (e) {
        console.error('Retro Fetch Error occurred (details hidden for security).');
        return null;
    }
}

async function main() {
    console.log("Fetching stats...");
    const existingStats = readExistingStats();

    const steam = await fetchSteamStats();
    const xbox = await fetchXboxStats(existingStats?.xbox || null);
    const retro = await fetchRetroStats();

    const data = {
        steam: steam ?? existingStats?.steam ?? null,
        xbox: xbox ?? existingStats?.xbox ?? null,
        retro: retro ?? existingStats?.retro ?? null,
        lastUpdated: new Date().toISOString()
    };
    
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`Stats updated successfully to ${OUTPUT_FILE}`);
}

main();