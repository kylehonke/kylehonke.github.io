const timeZone = 'America/Chicago';
const localDate = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
const formatter = options => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', ...options });
const monthFormat = formatter({});
const dayFormat = formatter({ day: 'numeric' });

export const chicagoDate = (instant = new Date()) => localDate.format(instant);
const firstDay = value => value.length === 7 ? value + '-01' : value;
const utc = value => new Date(firstDay(value) + 'T00:00:00Z');
const iso = date => date.toISOString().slice(0, 10);
const monthOnly = value => value.length === 7;
const offsetDay = (value, by) => iso(new Date(utc(value).getTime() + by * 86400000));

function lastDay(value) {
    if (!monthOnly(value)) return value;
    const date = utc(value);
    date.setUTCMonth(date.getUTCMonth() + 1, 0);
    return iso(date);
}

export function formatDate(value) {
    return (monthOnly(value) ? monthFormat : dayFormat).format(utc(value));
}

export function duration(start, end) {
    const approximate = monthOnly(start) || monthOnly(end);
    const a = utc(start), b = utc(end);
    let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
    // Clamp an anniversary to the last day of a shorter month (Jan 31 → Feb 28).
    const anniversary = count => {
        const date = new Date(a);
        date.setUTCMonth(a.getUTCMonth() + count + 1, 0);
        date.setUTCDate(Math.min(a.getUTCDate(), date.getUTCDate()));
        return date;
    };
    if (!approximate && anniversary(months) > b) months--;
    const units = [];
    function add(n, unit) { if (n) units.push(n + ' ' + unit + (n === 1 ? '' : 's')); }
    add(Math.floor(months / 12), 'year');
    add(months % 12, 'month');
    if (!approximate && months < 3) add(Math.round((b - anniversary(months)) / 86400000), 'day');
    if (!units.length) return approximate ? 'under a month' : '0 days';
    return (approximate ? 'about ' : '') + units.join(', ');
}

// With mixed precision, use the month if an unknown day could determine the boundary.
function boundary(a, b, later) {
    if (!a || !b) return a || b;
    if (a.slice(0, 7) === b.slice(0, 7) && (monthOnly(a) || monthOnly(b))) {
        if (a === b) return a;
        const exact = monthOnly(a) ? b : a;
        const month = a.slice(0, 7);
        if (exact === (later ? lastDay(month) : firstDay(month))) return exact;
        return month;
    }
    return (a > b) === later ? a : b;
}

function sharedInterval(a, b, today) {
    const start = boundary(a.start, b.start, true);
    const end = boundary(a.overlapEnd, b.overlapEnd, false);
    // An open entry with a month-only start is known to be active by today.
    const latestStart = value => lastDay(value) < today ? lastDay(value) : today;
    if ((b.overlapEnd && firstDay(b.overlapEnd) < latestStart(a.start)) ||
        (a.overlapEnd && firstDay(a.overlapEnd) < latestStart(b.start))) return null;
    return { start, end };
}

const byStart = (a, b) => b.start.localeCompare(a.start) || a.id.localeCompare(b.id);

export function experienceAt({ organizations, entries }, today) {
    const rows = entries.filter(entry => firstDay(entry.start) <= today).map(entry => ({
        ...entry, organizationName: organizations[entry.organization], transitions: [], alongside: [],
    }));
    const newestFirst = [...rows].sort(byStart);
    const next = new Map(rows.filter(row => row.promotedFrom).map(row => [row.promotedFrom, row]));

    for (const row of rows) {
        const successor = next.get(row.id);
        const end = row.end || (successor && offsetDay(successor.start, -1));
        row.finished = Boolean(end && (end <= today || successor));
        row.displayEnd = row.finished ? end : undefined;
        // Both public records can carry the same handoff date. Only the new title
        // occupies that day when calculating concurrent roles.
        row.overlapEnd = successor && end === successor.start ? offsetDay(end, -1) : row.displayEnd;
        if (successor) {
            const change = { from: { id: row.id, title: row.title }, to: { id: successor.id, title: successor.title }, date: successor.start };
            row.transitions.push(change);
            successor.transitions.push(change);
        }
    }
    // Track continuous service separately from title changes. Parallel roles can
    // extend a run without becoming a promotion. A real or uncertain gap resets it.
    const employment = new Map();
    for (const row of [...newestFirst].reverse()) {
        if (row.type !== 'work' || !row.organization) continue;
        const run = employment.get(row.organization);
        const until = row.displayEnd ? firstDay(row.displayEnd) : today;
        const latestStart = lastDay(row.start) < today ? lastDay(row.start) : today;
        if (run && latestStart <= offsetDay(run.until, 1)) {
            if (run.start !== row.start) row.employerSince = run.start;
            if (until > run.until) run.until = until;
        } else {
            employment.set(row.organization, { start: row.start, until });
        }
    }
    for (const row of rows) {
        const groups = new Map();
        for (const other of newestFirst) {
            if (other === row || other.promotedFrom === row.id || row.promotedFrom === other.id) continue;
            const range = sharedInterval(row, other, today);
            if (!range) continue;
            const key = other.organization ? 'org-' + other.organization : 'entry-' + other.id;
            if (!groups.has(key)) groups.set(key, { key, organization: other.organizationName, roles: [] });
            groups.get(key).roles.push({ id: other.id, title: other.title, ...range });
        }
        row.alongside = [...groups.values()];
    }
    return {
        now: rows.filter(row => !row.finished).sort(byStart),
        previously: rows.filter(row => row.finished).sort((a, b) => b.displayEnd.localeCompare(a.displayEnd) || byStart(a, b)),
    };
}
