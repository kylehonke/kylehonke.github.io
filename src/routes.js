// Page metadata shared by the app (titles, Extras list) and vite.config.js (per-route HTML, sitemap).
// Keep this file free of JSX so the Vite config can import it.

export const SITE_URL = 'https://kylehonke.github.io';
export const SITE_NAME = 'Kyle Honke';

// hidden: routed but not linked from Extras, not in the sitemap, and noindexed.
// noindex: linked, but kept out of search results and the sitemap.
export const routes = [
    {
        path: '/',
        title: 'Kyle Honke | ML Engineer & Software Developer',
        description: 'Portfolio of Kyle Honke, a BAS Software Development candidate specializing in Machine Learning, Python, TensorFlow, C++, and Java.',
    },
    {
        path: '/about',
        title: 'About',
        description: 'About Kyle Honke: an Austin native Software Development BAS student at ACC and Software Engineer at Clozure, working across software engineering, machine learning, and data science.',
    },
    {
        path: '/projects',
        title: 'Projects',
        description: 'Featured projects by Kyle Honke, from LSTM time series models and predictive maintenance with deep representation learning to Navi AI and data structures in C++.',
    },
    {
        path: '/extras',
        title: 'Extras',
        description: 'The fun stuff: gaming stats, Storm the cat, Lego, and music.',
    },
    {
        path: '/extras/gaming',
        title: 'Gaming',
        description: 'All-time favorite games plus live Steam, Xbox, and RetroAchievements stats from Kyle Honke.',
    },
    {
        path: '/extras/storm',
        title: 'Storm',
        description: 'Storm, a fluffy grey covid kitty with no respect for personal space.',
        noindex: true,
    },
    {
        path: '/extras/lego',
        title: 'Lego',
        description: 'Lego builds and videos from groovybricks, Kyle Honke\'s Lego YouTube channel.',
    },
    {
        path: '/extras/music',
        title: 'Music',
        description: 'Music production by Kyle Honke, published on the groovyKyle YouTube channel.',
    },
    {
        path: '/extras/food',
        title: 'Food',
        description: 'A few favorite Austin restaurants.',
        hidden: true,
    },
];

export const notFoundRoute = {
    path: '/404',
    title: 'Page not found',
    description: 'This page does not exist.',
    noindex: true,
};

export const normalizePath = (pathname) => pathname.replace(/\/+$/, '') || '/';

export const findRoute = (pathname) => {
    const path = normalizePath(pathname);
    return routes.find(route => route.path === path) ?? notFoundRoute;
};

export const pageTitle = (route) => (route.path === '/' ? route.title : `${route.title} | ${SITE_NAME}`);

export const isIndexable = (route) => !route.hidden && !route.noindex;

// GitHub Pages serves each route from <path>/index.html, so canonical URLs end with a slash.
export const canonicalUrl = (route) => `${SITE_URL}${route.path === '/' ? '/' : `${route.path}/`}`;
