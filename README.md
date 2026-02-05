# Kyle Honke's Portfolio

A professional portfolio website built with React, Vite, and Vanilla CSS. Features automated gaming stats fetching via GitHub Actions.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Locally**:
    ```bash
    npm run dev
    ```

3.  **Build**:
    ```bash
    npm run build
    ```

## Configuration
### Content
- **Projects**: Edit `src/data/projects.json`.
- **Restaurants**: Edit `src/data/restaurants.json`.
- **Bio/Text**: Edit the respective components in `src/pages/`.
- **Resume**: Replace `public/resume.pdf` with your actual resume file.

### Automation (Gaming Stats)
The site uses a GitHub Action to fetch stats from Steam, Xbox, and RetroAchievements daily.

1.  **Get API Keys**:
    - **Steam**: [Key](https://steamcommunity.com/dev/apikey) & SteamID (64-bit).
    - **Xbox**: Register at [OpenXBL](https://xbl.io/) to get an API key.
    - **RetroAchievements**: Request API key from their site/settings.

2.  **Add Repository Secrets**:
    Go to `Settings > Secrets and variables > Actions` in your GitHub repo and add:
    - `STEAM_API_KEY`
    - `STEAM_ID`
    - `XBOX_API_KEY`
    - `RETRO_API_KEY`
    - `RETRO_USER`

## Deployment
This site is ready for GitHub Pages.
1. Update `vite.config.js` with `base: '/repo-name/'` if not at root domain.
2. Push to GitHub.
3. Enable GitHub Pages in repo settings (deploy from `dist` branch or via Action).
