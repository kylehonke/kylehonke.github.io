const datePattern = /^\d{4}-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?$/;
const validText = value => typeof value === 'string' && value.trim().length > 0;
function validDate(value) {
    if (typeof value !== 'string' || !datePattern.test(value)) return false;
    const full = value.length === 7 ? value + '-01' : value;
    return new Date(full + 'T00:00:00Z').toISOString().slice(0, 10) === full;
}
function earlier(a, b) {
    // Month-only endpoints in the same month have no known order.
    const precision = Math.min(a.length, b.length);
    return a.slice(0, precision) < b.slice(0, precision);
}

export function validateExperience({ organizations, entries }) {
    const byId = new Map();
    const successors = new Set();
    for (const entry of entries) {
        const { id, type, title, organization, start, end, expectedEnd, links } = entry;
        const fail = message => { throw new Error('experience.json [' + id + ']: ' + message); };
        if (!validText(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || byId.has(id)) fail('invalid or duplicate ID');
        if (!['work', 'education'].includes(type) || !validText(title)) fail('check type and title');
        if (organization !== undefined && (!Object.hasOwn(organizations, organization) || !validText(organizations[organization]))) fail('unknown organization');
        if (!validDate(start)) fail('invalid start');
        for (const [field, value] of Object.entries({ end, expectedEnd })) {
            if (value !== undefined && (!validDate(value) || earlier(value, start))) fail('invalid ' + field);
        }
        if (entry.emphasis !== undefined && entry.emphasis !== 'subtle') fail('unknown emphasis');
        if (entry.summary !== undefined && !validText(entry.summary)) fail('invalid summary');
        if (links !== undefined && (!Array.isArray(links) || links.some(link => !link || !validText(link.label) ||
            !validText(link.url) || !/^(https?:\/\/|\/(?!\/))/.test(link.url) || /[\\\s]/.test(link.url)))) fail('invalid link');
        byId.set(id, entry);
    }
    for (const entry of entries) {
        if (entry.promotedFrom === undefined) continue;
        const prior = byId.get(entry.promotedFrom);
        // Strictly increasing starts also rule out every cycle.
        if (!prior || entry.type !== 'work' || prior.type !== 'work' || !entry.organization ||
            entry.organization !== prior.organization || entry.start.length !== 10 ||
            !earlier(prior.start, entry.start) || (prior.end && earlier(entry.start, prior.end)) ||
            successors.has(prior.id)) {
            throw new Error('experience.json [' + entry.id + ']: invalid promotedFrom (' + entry.promotedFrom + ')');
        }
        successors.add(prior.id);
    }
}
