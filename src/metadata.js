import { findRoute, routeMetadata } from './routes.js';

// Reuse static tags, remove obsolete tags, and collapse any duplicates.
const syncTag = (tag, key, name, attribute, value) => {
    const [existing, ...duplicates] = document.head.querySelectorAll(`${tag}[${key}="${name}"]`);
    duplicates.forEach(node => node.remove());
    if (value == null) {
        existing?.remove();
        return;
    }
    const node = existing ?? document.createElement(tag);
    node.setAttribute(key, name);
    node.setAttribute(attribute, value);
    if (!existing) document.head.append(node);
};

export const syncRouteMetadata = (pathname) => {
    const { title, description, robots, url } = routeMetadata(findRoute(pathname));
    document.title = title;
    syncTag('meta', 'name', 'description', 'content', description);
    syncTag('meta', 'name', 'robots', 'content', robots);
    syncTag('link', 'rel', 'canonical', 'href', url);
    syncTag('meta', 'property', 'og:url', 'content', url);
    syncTag('meta', 'property', 'og:title', 'content', title);
    syncTag('meta', 'property', 'og:description', 'content', description);
};
