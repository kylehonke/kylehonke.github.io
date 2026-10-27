import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { canonicalUrl, findRoute, isIndexable, notFoundRoute, pageTitle, routes } from './src/routes.js';

const META_BLOCK = /<!-- route-meta -->[\s\S]*?<!-- \/route-meta -->|<!-- route-meta -->/;

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

const renderMeta = (route) => {
    const title = escapeHtml(pageTitle(route));
    const description = escapeHtml(route.description);
    const url = canonicalUrl(route);
    return [
        '<!-- route-meta -->',
        `<title>${title}</title>`,
        `<meta name="description" content="${description}" />`,
        ...(isIndexable(route) ? [] : ['<meta name="robots" content="noindex" />']),
        ...(route === notFoundRoute ? [] : [`<link rel="canonical" href="${url}" />`, `<meta property="og:url" content="${url}" />`]),
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${description}" />`,
        '<!-- /route-meta -->',
    ].join('\n    ');
};

// GitHub Pages only returns HTTP 200 for files that exist, so every route gets its own
// index.html (with route-specific metadata) instead of relying on the 404.html fallback.
const staticRoutes = () => {
    let outDir;
    return {
        name: 'static-routes',
        configResolved(config) {
            // closeBundle also fires when the dev server shuts down; only write files for builds.
            if (config.command === 'build') outDir = config.build.outDir;
        },
        transformIndexHtml(html, ctx) {
            return html.replace(META_BLOCK, renderMeta(findRoute(ctx.originalUrl?.split('?')[0] ?? '/')));
        },
        async closeBundle() {
            if (!outDir) return;
            const template = await readFile(join(outDir, 'index.html'), 'utf8');
            const writePage = async (relativeDir, route, fileName = 'index.html') => {
                const dir = join(outDir, relativeDir);
                await mkdir(dir, { recursive: true });
                await writeFile(join(dir, fileName), template.replace(META_BLOCK, renderMeta(route)));
            };

            await Promise.all(routes.filter(route => route.path !== '/').map(route => writePage(route.path, route)));
            await writePage('', notFoundRoute, '404.html');

            const urls = routes.filter(isIndexable).map(route => `  <url><loc>${canonicalUrl(route)}</loc></url>`);
            await writeFile(join(outDir, 'sitemap.xml'), [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                ...urls,
                '</urlset>',
                '',
            ].join('\n'));
        },
    };
};

export default defineConfig({
    plugins: [react(), staticRoutes()],
});
