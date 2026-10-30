import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const STEAM_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID;
const XBOX_KEY = process.env.XBOX_API_KEY;
const XBOX_GAMERTAG = process.env.XBOX_GAMERTAG || 'grooovyKyle';
const XBOX_XUID = process.env.XBOX_XUID || null;
const RETRO_KEY = process.env.RETRO_API_KEY;
const RETRO_USER = process.env.RETRO_USER;

const OUTPUT_FILE = join(import.meta.dirname, '../public/stats.json');
const XBOX_RECENT_TITLE_LIMIT = 5;

// Fields that look like an achievement rather than a game title.
const ACHIEVEMENT_KEYS = ['description', 'lockedDescription', 'progressState', 'progression', 'rewards', 'achievementType', 'timeUnlocked'];
// Fields only a game title carries.
const TITLE_DETAIL_KEYS = ['titleHistory', 'displayImage', 'displayImageUrl', 'stats', 'gamePass', 'devices', 'modernTitleId', 'xboxLiveTier'];
const TITLE_KEYS = [...TITLE_DETAIL_KEYS, 'titleId', 'lastPlayed', 'lastTimePlayed'];

const hasAny = (item, keys) => keys.some(key => item[key]);

const isTitleLike = (item) =>
    Boolean(item.name || item.title || item.titleName) && (hasAny(item, TITLE_KEYS) || item.type === 'Game');

const isAchievementOnly = (item) =>
    (hasAny(item, ACHIEVEMENT_KEYS) || item.isUnlocked !== undefined) && !hasAny(item, TITLE_DETAIL_KEYS);

async function getJson(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

async function readExistingStats() {
    try {
        return JSON.parse(await readFile(OUTPUT_FILE, 'utf8'));
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.warn('Could not read existing stats.json, continuing with fresh data.');
        }
        return null;
    }
}

function unwrapApiResponse(payload) {
    if (!payload || typeof payload !== 'object') {
        return payload;
    }
    if (Object.hasOwn(payload, 'code') && payload.code !== 200) {
        return null;
    }
    return Object.hasOwn(payload, 'content') ? payload.content : payload;
}

function getSettingValue(settings, ids) {
    if (!Array.isArray(settings)) {
        return null;
    }
    for (const id of ids) {
        const value = settings.find(setting => setting?.id === id)?.value;
        if (value) {
            return value;
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
    if (safeMinutes <= 0) return '0h';
    if (safeMinutes < 60) return '<1h';
    return `${Math.round(safeMinutes / 60)}h`;
}

function parsePlaytimeMinutes(title) {
    const minutes = [
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
        title?.titleHistory?.minutesPlayed,
    ].find(candidate => candidate != null && candidate !== '');

    return minutes === undefined ? 0 : Math.max(0, toNumber(minutes, 0));
}

function parseLastPlayed(title) {
    return (
        title?.titleHistory?.lastTimePlayed ||
        title?.titleHistory?.lastPlayed ||
        title?.lastTimePlayed ||
        title?.lastPlayed ||
        title?.lastPlayedAt ||
        title?.history?.lastPlayed ||
        null
    );
}

function normalizeExistingRecentGames(recentGames) {
    if (!Array.isArray(recentGames)) {
        return [];
    }

    return recentGames
        .map(game => {
            if (typeof game === 'string') {
                return { title: game, titleId: null, playtimeMinutes: 0, playtimeHours: '0h', lastPlayed: null, imageUrl: null };
            }
            if (!game || typeof game !== 'object') {
                return null;
            }

            const playtimeMinutes = toNumber(game.playtimeMinutes ?? game.minutesPlayed ?? game.timePlayed ?? game.playtime, 0);
            return {
                title: game.title || game.name || game.titleName || 'Unknown Title',
                titleId: game.titleId ?? game.id ?? null,
                playtimeMinutes,
                playtimeHours: game.playtimeHours || toHoursLabel(playtimeMinutes),
                lastPlayed: game.lastPlayed || game.lastTimePlayed || null,
                imageUrl: game.imageUrl || game.displayImage || game.displayImageUrl || null,
            };
        })
        .filter(Boolean)
        .slice(0, XBOX_RECENT_TITLE_LIMIT);
}

// Guarantees the public Xbox shape the Gaming page relies on.
function sanitizeXboxForPublic(xbox) {
    if (!xbox || typeof xbox !== 'object') {
        return null;
    }

    return {
        gamertag: xbox.gamertag || XBOX_GAMERTAG,
        gamerscore: toNumber(xbox.gamerscore, 0),
        gamerPictureUrl: xbox.gamerPictureUrl || xbox.profilePicture || xbox.avatar || null,
        recentGames: normalizeExistingRecentGames(xbox.recentGames),
        fromCache: Boolean(xbox.fromCache),
        lastFetchedAt: xbox.lastFetchedAt || null,
    };
}

function extractTitlesFromPresencePayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const lastSeenTimestamp = payload.lastSeen?.timestamp || null;
    const lastSeenTitle = payload.lastSeen?.titleName || null;

    const titles = (Array.isArray(payload.devices) ? payload.devices : [])
        .flatMap(device => (Array.isArray(device?.titles) ? device.titles : []))
        .filter(deviceTitle => deviceTitle?.name || deviceTitle?.id)
        .map(deviceTitle => ({
            name: deviceTitle.name || lastSeenTitle || 'Unknown Title',
            titleId: deviceTitle.id || null,
            lastTimePlayed: deviceTitle.lastModified || lastSeenTimestamp,
            playtimeMinutes: 0,
        }));

    if (titles.length === 0 && lastSeenTitle) {
        titles.push({
            name: lastSeenTitle,
            titleId: payload.lastSeen?.titleId || null,
            lastTimePlayed: lastSeenTimestamp,
            playtimeMinutes: 0,
        });
    }

    return titles;
}

function extractTitlesFromXboxPayload(payload) {
    if (!payload) {
        return [];
    }

    // OpenXBL endpoints nest the title list under different keys; use the first list that contains titles.
    const candidates = [
        payload,
        payload.titles,
        payload.titleHistory,
        payload.items,
        payload.recentGames,
        payload.results?.titles,
        payload.data?.titles,
        payload.Titles,
        payload.games,
        extractTitlesFromPresencePayload(payload),
    ];

    for (const list of candidates) {
        if (!Array.isArray(list)) continue;
        const titles = list.filter(item => item && typeof item === 'object' && isTitleLike(item));
        if (titles.length > 0) {
            return titles;
        }
    }

    return [];
}

function normalizeRecentXboxGames(rawTitles, limit = XBOX_RECENT_TITLE_LIMIT) {
    if (!Array.isArray(rawTitles)) {
        return [];
    }

    const seenKeys = new Set();
    const lastPlayedTime = game => (game.lastPlayed ? new Date(game.lastPlayed).getTime() : 0);

    return rawTitles
        .filter(title => title && typeof title === 'object' && !isAchievementOnly(title))
        .map(title => {
            const playtimeMinutes = parsePlaytimeMinutes(title);
            return {
                title: title.name || title.titleName || title.title || 'Unknown Title',
                titleId: title.titleId ?? title.id ?? null,
                playtimeMinutes,
                playtimeHours: toHoursLabel(playtimeMinutes),
                lastPlayed: parseLastPlayed(title),
                imageUrl: title.displayImage || title.displayImageUrl || title.image || null,
            };
        })
        .filter(game => {
            if (game.title === 'Unknown Title') return false;
            const key = game.titleId ? `id:${game.titleId}` : `name:${game.title.toLowerCase()}`;
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
        })
        .sort((a, b) => lastPlayedTime(b) - lastPlayedTime(a))
        .slice(0, limit);
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
        recentGames: nextXbox.recentGames?.length > 0
            ? nextXbox.recentGames
            : (nextXbox.fromCache ? (fallbackXbox.recentGames || []) : []),
    };
}

async function fetchXboxJson(pathname) {
    for (const endpoint of [`https://api.xbl.io${pathname}`, `https://xbl.io/api${pathname}`]) {
        try {
            const payload = unwrapApiResponse(await getJson(endpoint, {
                headers: { 'X-Authorization': XBOX_KEY, Accept: 'application/json' },
            }));
            if (payload) {
                return payload;
            }
            console.warn(`Xbox wrapper payload rejected for ${endpoint}`);
        } catch (err) {
            console.warn(`Xbox request failed for ${endpoint}: ${err.message}`);
        }
    }
    return null;
}

async function fetchXboxTitles(xuid) {
    const id = xuid ? encodeURIComponent(xuid) : null;
    // Tried in order until one returns titles.
    const paths = [
        id && `/v2/titles/${id}`,
        '/v2/titles',
        id && `/v3/achievements/player/${id}`,
        id && `/v2/player/titleHistory/${id}`,
        '/v2/player/titleHistory',
        id && `/v2/achievements/player/${id}`,
        id && `/v2/presence/${id}`,
        '/v2/achievements',
        '/v2/presence',
    ].filter(Boolean);

    for (const path of paths) {
        const titles = extractTitlesFromXboxPayload(await fetchXboxJson(path));
        if (titles.length > 0) {
            return titles;
        }
    }
    return [];
}

async function fetchSteamStats() {
    if (!STEAM_KEY || !STEAM_ID) {
        console.warn('Steam env vars missing');
        return null;
    }

    const steamUrl = (method, params) =>
        `https://api.steampowered.com/${method}/?${new URLSearchParams({ key: STEAM_KEY, ...params })}`;

    try {
        const [ownedData, profileData, recentData] = await Promise.all([
            getJson(steamUrl('IPlayerService/GetOwnedGames/v0001', { steamid: STEAM_ID, format: 'json', include_appinfo: 1, include_played_free_games: 1 })),
            getJson(steamUrl('ISteamUser/GetPlayerSummaries/v0002', { steamids: STEAM_ID })),
            getJson(steamUrl('IPlayerService/GetRecentlyPlayedGames/v0001', { steamid: STEAM_ID, format: 'json' })),
        ]);

        const games = (ownedData.response.games || []).toSorted((a, b) => b.playtime_forever - a.playtime_forever);
        const profile = profileData.response.players[0];

        return {
            profileUrl: profile?.profileurl,
            avatar: profile?.avatarfull,
            games: games.slice(0, 10).map(game => ({
                name: game.name,
                playtime_forever: game.playtime_forever,
                icon: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
            })),
            lastPlayed: recentData.response.games?.[0]?.name || games[0]?.name,
        };
    } catch {
        console.error('Steam Fetch Error occurred (details hidden for security).');
        return null;
    }
}

async function fetchXboxStats(previousXbox = null, fallbackXuid = null) {
    if (!XBOX_KEY) {
        console.warn('Xbox env var missing');
        return previousXbox || null;
    }

    try {
        const accountData = await fetchXboxJson('/v2/account');
        if (!accountData) {
            throw new Error('Could not fetch Xbox account data.');
        }

        const profileUser = accountData.profileUsers?.[0] || accountData.people?.[0] || {};
        const settings = profileUser.settings || [];

        const xuid = XBOX_XUID || profileUser.id || profileUser.hostId || accountData.xuid || fallbackXuid || null;
        const gamertag =
            getSettingValue(settings, ['Gamertag', 'ModernGamertag']) ||
            accountData.gamertag ||
            previousXbox?.gamertag ||
            XBOX_GAMERTAG;
        const gamerscore = toNumber(
            getSettingValue(settings, ['Gamerscore', 'GamerScore']) ?? accountData.gamerscore ?? previousXbox?.gamerscore ?? 0,
            0
        );
        const gamerPictureUrl =
            getSettingValue(settings, ['GameDisplayPicRaw', 'PublicGamerpic', 'GameDisplayPic']) ||
            accountData.profilePicture ||
            previousXbox?.gamerPictureUrl ||
            null;

        const titles = await fetchXboxTitles(xuid);

        return mergeXboxData({
            gamertag,
            gamerscore,
            gamerPictureUrl,
            recentGames: normalizeRecentXboxGames(titles),
            fromCache: false,
            lastFetchedAt: new Date().toISOString(),
        }, previousXbox);
    } catch {
        console.error('Xbox Fetch Error occurred (details hidden for security).');
        return previousXbox
            ? { ...previousXbox, fromCache: true, lastFetchedAt: new Date().toISOString() }
            : null;
    }
}

async function fetchRetroStats() {
    if (!RETRO_KEY || !RETRO_USER) {
        console.warn('Retro env vars missing');
        return null;
    }

    try {
        const params = new URLSearchParams({ z: RETRO_USER, y: RETRO_KEY, u: RETRO_USER, g: 3, a: 10 });
        const data = await getJson(`https://retroachievements.org/API/API_GetUserSummary.php?${params}`);

        return {
            user: RETRO_USER,
            hardcorePoints: data.TotalPoints,
            softcorePoints: data.TotalSoftcorePoints,
            lastGame: data.LastGame ? {
                title: data.LastGame.Title,
                consoleName: data.LastGame.ConsoleName,
                icon: data.LastGame.ImageIcon?.startsWith('http')
                    ? data.LastGame.ImageIcon
                    : `https://media.retroachievements.org${data.LastGame.ImageIcon}`,
            } : null,
            recentAchievements: data.RecentAchievements
                ? Object.values(data.RecentAchievements)
                    .flatMap(game => Object.values(game))
                    .sort((a, b) => new Date(b.DateAwarded) - new Date(a.DateAwarded))
                    .slice(0, 5)
                    .map(achievement => ({
                        title: achievement.Title,
                        game: achievement.GameTitle,
                        points: achievement.Points,
                        dateAwarded: achievement.DateAwarded,
                        badgeUrl: `https://media.retroachievements.org/Badge/${achievement.BadgeName}.png`,
                        hardcore: achievement.HardcoreAchieved === 1,
                    }))
                : [],
        };
    } catch {
        console.error('Retro Fetch Error occurred (details hidden for security).');
        return null;
    }
}

// Timestamps change on every run; leaving them out lets an unchanged run skip the write (and the workflow's commit/deploy).
const withoutTimestamps = (stats) => JSON.stringify({
    ...stats,
    lastUpdated: undefined,
    xbox: stats?.xbox && { ...stats.xbox, lastFetchedAt: undefined },
});

async function main() {
    console.log('Fetching stats...');
    const existingStats = await readExistingStats();
    const previousXboxRaw = existingStats?.xbox || null;
    const previousXbox = sanitizeXboxForPublic(previousXboxRaw);

    const [steam, xbox, retro] = await Promise.all([
        fetchSteamStats(),
        fetchXboxStats(previousXbox, previousXboxRaw?.xuid || null),
        fetchRetroStats(),
    ]);

    const data = {
        steam: steam ?? existingStats?.steam ?? null,
        xbox: sanitizeXboxForPublic(xbox ?? previousXbox),
        retro: retro ?? existingStats?.retro ?? null,
        lastUpdated: new Date().toISOString(),
    };

    if (existingStats && withoutTimestamps(data) === withoutTimestamps(existingStats)) {
        console.log('No stat changes; leaving stats.json untouched.');
        return;
    }

    await mkdir(dirname(OUTPUT_FILE), { recursive: true });
    await writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`Stats updated successfully to ${OUTPUT_FILE}`);
}

await main();
