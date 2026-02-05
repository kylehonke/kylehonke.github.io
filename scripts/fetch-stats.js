// scripts/fetch-stats.js
const fs = require('fs');
const path = require('path');

// Env variables (provided by GitHub Actions Secrets)
const STEAM_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID;
const XBOX_KEY = process.env.XBOX_API_KEY; // OpenXBL Key
const RETRO_KEY = process.env.RETRO_API_KEY;
const RETRO_USER = process.env.RETRO_USER;

const OUTPUT_FILE = path.join(__dirname, '../public/stats.json');

async function fetchSteamStats() {
    if (!STEAM_KEY || !STEAM_ID) return null;
    try {
        // Get Owned Games
        const ownedRes = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json&include_appinfo=1&include_played_free_games=1`);
        const ownedData = await ownedRes.json();
        const games = ownedData.response.games || [];

        // Sort by playtime
        games.sort((a, b) => b.playtime_forever - a.playtime_forever);

        // Get Profile (for avatar/url)
        const profileRes = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
        const profileData = await profileRes.json();
        const profile = profileData.response.players[0];

        // Get Recently Played
        const recentRes = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json`);
        const recentData = await recentRes.json();

        return {
            profileUrl: profile?.profileurl,
            avatar: profile?.avatarfull,
            games: games.slice(0, 10).map(g => ({
                name: g.name,
                playtime_forever: g.playtime_forever,
                icon: `http://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
            })),
            lastPlayed: recentData.response.games?.[0]?.name || games[0]?.name
        };
    } catch (e) {
        console.error('Steam Fetch Error:', e);
        return null;
    }
}

async function fetchXboxStats() {
    if (!XBOX_KEY) return null;
    try {
        // OpenXBL API
        const profileRes = await fetch('https://xbl.io/api/v2/account', {
            headers: { 'X-Authorization': XBOX_KEY, 'Accept': 'application/json' }
        });
        const profileData = await profileRes.json();

        // This depends on OpenXBL response structure, simplified here
        // Need to check specific endpoints for achievements/games if possible with free tier
        // Assuming profileData returns basic summary

        return {
            gamertag: profileData.profileUsers?.[0]?.settings?.find(s => s.id === 'Gamertag')?.value || 'grooovyKyle',
            gamerscore: profileData.profileUsers?.[0]?.settings?.find(s => s.id === 'Gamerscore')?.value || '0',
            recentGames: [] // OpenXBL might need separate call for activity
        };
    } catch (e) {
        console.error('Xbox Fetch Error:', e);
        return null;
    }
}

async function fetchRetroStats() {
    if (!RETRO_KEY || !RETRO_USER) return null;
    try {
        const res = await fetch(`https://retroachievements.org/API/API_GetUserSummary.php?z=${RETRO_USER}&y=${RETRO_KEY}&u=${RETRO_USER}`);
        // Note: RetroAchievements API typically requires param 'y' as API key. Check their docs
        const data = await res.json();

        return {
            user: RETRO_USER,
            points: data.Points,
            recentAchievements: data.RecentAchievements ? Object.values(data.RecentAchievements).map(a => ({
                game: a.GameTitle,
                title: a.Title,
                points: a.Points
            })).slice(0, 5) : []
        };
    } catch (e) {
        console.error('Retro Fetch Error:', e);
        return null;
    }
}

async function main() {
    const steam = await fetchSteamStats();
    const xbox = await fetchXboxStats();
    const retro = await fetchRetroStats();

    const data = {
        steam,
        xbox,
        retro,
        lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log('Stats updated successfully!');
}

main();
