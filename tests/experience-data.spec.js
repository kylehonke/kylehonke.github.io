import { test, expect } from 'playwright/test';
import { readFileSync } from 'node:fs';
import { chicagoDate, duration, experienceAt } from '../src/experience/timeline.js';
import { validateExperience } from '../src/experience/validate.js';

const published = JSON.parse(readFileSync(new URL('../src/data/experience.json', import.meta.url)));
// Keep historical scenarios fixed so normal edits to the portfolio need no test updates.
const data = {
    organizations: { 'ut-austin': 'UT Austin', clozure: 'Clozure', acc: 'Austin Community College', shore: 'Shore' },
    entries: [
        { id: 'ut-intern', type: 'work', title: 'Intern', organization: 'ut-austin', start: '2026-10-27' },
        { id: 'clozure-engineer-1', type: 'work', title: 'Engineer', organization: 'clozure', start: '2026-08-31', promotedFrom: 'clozure-intern' },
        { id: 'acc-bas', type: 'education', title: 'BAS', organization: 'acc', start: '2025-05', expectedEnd: '2026-12' },
        { id: 'clozure-intern', type: 'work', title: 'Intern', organization: 'clozure', start: '2026-05-18', end: '2026-08-31' },
        { id: 'aas-programming', type: 'education', title: 'AAS', start: '2023-01', end: '2025-05' },
        { id: 'shore-server', type: 'work', title: 'Server', organization: 'shore', start: '2021-06', end: '2023-10' },
    ],
};
const utPromotion = { id: 'ut-next-role', type: 'work', title: 'Example role', organization: 'ut-austin', start: '2027-01-01', promotedFrom: 'ut-intern' };
const ids = entries => entries.map(entry => entry.id);
const role = (view, id) => [...view.now, ...view.previously].find(entry => entry.id === id);
const groups = (entry, org) => entry.alongside.find(group => group.organization === org)?.roles || [];

test('the data file is valid and the shared-month graduation boundary never implies overlap', () => {
    validateExperience(published);
    validateExperience(data);
    const view = experienceAt(data, '2026-11-19');
    expect(ids(view.now)).toEqual(['ut-intern', 'clozure-engineer-1', 'acc-bas']);
    expect(ids(view.previously)).toEqual(['clozure-intern', 'aas-programming', 'shore-server']);
    const aas = role(view, 'aas-programming');
    expect(aas.alongside.flatMap(group => ids(group.roles))).toEqual(['shore-server']);
    expect(groups(aas, 'Shore')[0]).toMatchObject({ start: '2023-01', end: '2023-10' });
});

test('same-day promotion preserves the explicit final date and links both roles', () => {
    const before = experienceAt(data, '2026-08-30');
    expect(role(before, 'clozure-engineer-1')).toBeUndefined();
    expect(role(before, 'clozure-intern').transitions).toEqual([]);
    const view = experienceAt(data, '2026-08-31');
    const intern = role(view, 'clozure-intern'), engineer = role(view, 'clozure-engineer-1');
    expect(intern.displayEnd).toBe('2026-08-31');
    expect(engineer.employerSince).toBe('2026-05-18');
    expect(intern.transitions).toEqual(engineer.transitions);
    expect(groups(engineer, 'Clozure')).toEqual([]);
    expect(groups(role(view, 'acc-bas'), 'Clozure')).toHaveLength(2);
});

test('only a confirmed graduation changes BAS status and coworking intervals', () => {
    const date = '2027-01-01';
    expect(ids(experienceAt(data, date).now)).toContain('acc-bas');
    const edited = structuredClone(data);
    edited.entries.find(entry => entry.id === 'acc-bas').end = '2026-12';
    const view = experienceAt(edited, date);
    expect(role(view, 'acc-bas').finished).toBe(true);
    for (const id of ['clozure-engineer-1', 'ut-intern']) {
        expect(groups(role(view, id), 'Austin Community College')[0].end).toBe('2026-12');
    }
});

test('a scheduled promotion becomes visible at Chicago midnight and continues employer tenure', () => {
    const edited = { ...data, entries: [...data.entries, utPromotion] };
    validateExperience(edited);
    const before = experienceAt(edited, chicagoDate(new Date('2027-01-01T05:59:59Z')));
    expect(role(before, 'ut-next-role')).toBeUndefined();
    expect(role(before, 'ut-intern').transitions).toEqual([]);
    for (const instant of ['2027-01-01T06:00:00Z', '2027-02-01T06:00:00Z']) {
        const view = experienceAt(edited, chicagoDate(new Date(instant)));
        expect(role(view, 'ut-intern').displayEnd).toBe('2026-12-31');
        expect(role(view, 'ut-next-role').employerSince).toBe('2026-10-27');
        expect(groups(role(view, 'clozure-engineer-1'), 'UT Austin').map(item => [item.start, item.end]))
            .toEqual([['2027-01-01', undefined], ['2026-10-27', '2026-12-31']]);
    }
});

test('a gap resets tenure and independent concurrent roles do not create a promotion', () => {
    const edited = structuredClone(data);
    edited.entries.find(entry => entry.id === 'ut-intern').end = '2026-12-15';
    edited.entries.push(utPromotion);
    const view = experienceAt(edited, '2027-01-02');
    expect(role(view, 'ut-next-role').employerSince).toBeUndefined();
    const parallel = { ...utPromotion, id: 'other-ut', start: '2026-11-01' };
    delete parallel.promotedFrom;
    const concurrent = experienceAt({ ...data, entries: [...data.entries, parallel] }, '2026-11-19');
    expect(role(concurrent, 'other-ut').transitions).toEqual([]);
    expect(ids(groups(role(concurrent, 'ut-intern'), 'UT Austin'))).toContain('other-ut');
});

test('duration uses calendar anniversaries and preserves approximation', () => {
    expect(duration('2026-10-27', '2026-11-19')).toBe('23 days');
    expect(duration('2026-08-31', '2026-11-19')).toBe('2 months, 19 days');
    expect(duration('2024-01-31', '2024-02-29')).toBe('1 month');
    expect(duration('2025-05', '2026-12')).toBe('about 1 year, 7 months');
});

test('invalid edits identify the offending record', () => {
    const original = data.entries.find(entry => entry.id === 'ut-intern');
    for (const edit of [{ id: 'ut-intern' }, { start: '2027-02-29' }, { end: '2021-01' }, { organization: 'missing' },
        { promotedFrom: 'missing' }, { promotedFrom: 'clozure-intern' }, { promotedFrom: 'bad' },
        { organization: 'clozure', promotedFrom: 'clozure-intern' }, { links: [{ label: 'x', url: 'javascript:foo' }] }]) {
        const bad = { ...original, id: 'bad', ...edit };
        expect(() => validateExperience({ ...data, entries: [...data.entries, bad] })).toThrow(bad.id);
    }
    const cycle = structuredClone(data);
    cycle.entries.find(entry => entry.id === 'clozure-intern').promotedFrom = 'clozure-engineer-1';
    expect(() => validateExperience(cycle)).toThrow('clozure-intern');
});
