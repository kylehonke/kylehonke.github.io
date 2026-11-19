import { useEffect, useState } from 'react';
import experience from '../data/experience.json';
import { chicagoDate, duration, experienceAt, formatDate } from '../experience/timeline';
import '../styles/experience.css';

function useChicagoDate() {
    const [today, setToday] = useState(chicagoDate);
    useEffect(() => {
        let timer;
        function refresh() {
            clearTimeout(timer);
            setToday(chicagoDate());
            // Chicago midnight is on a whole UTC hour, including across DST.
            timer = setTimeout(refresh, 3600000 - Date.now() % 3600000);
        }
        refresh();
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, []);
    return today;
}

function DateRange({ start, end }) {
    return <><time dateTime={start}>{formatDate(start)}</time> – {end ? <time dateTime={end}>{formatDate(end)}</time> : 'present'}</>;
}

function followRole(id) {
    const tile = document.getElementById('experience-' + id);
    if (!tile) return;
    tile.open = true;
    tile.querySelector('summary').focus({ preventScroll: true });
    tile.scrollIntoView({ block: 'center', behavior: 'instant' });
}

function Promotion({ change, entry }) {
    function title(role) {
        return role.id === entry.id ? <strong>{role.title}</strong> :
            <button className="role-link" type="button" onClick={() => followRole(role.id)}>{role.title}</button>;
    }
    return (
        <div className="experience-transition">
            <div className="experience-detail-heading"><strong>at {entry.organizationName}</strong><time dateTime={change.date}>{formatDate(change.date)}</time></div>
            <div className="experience-progression">{title(change.from)} <span aria-label="to">→</span> {title(change.to)}</div>
        </div>
    );
}

function Entry({ entry, today }) {
    const { title, type, organizationName, start, displayEnd, summary, links, transitions, alongside, employerSince } = entry;
    const expected = !entry.finished && entry.expectedEnd;
    const expandable = Boolean(summary || links?.length || transitions.length || alongside.length || employerSince || expected);
    const Top = expandable ? 'summary' : 'div';
    const Tile = expandable ? 'details' : 'article';
    return (
        <Tile id={'experience-' + entry.id} className={'experience-entry' + (entry.emphasis === 'subtle' ? ' experience-subtle' : '')}>
            <Top className="experience-top">
                <strong className="experience-name">{title}</strong>
                <span className="experience-dates"><DateRange start={start} end={displayEnd} /></span>
                <span className="experience-org">{organizationName && <span>{organizationName}</span>}<span className={'experience-tag tag-' + type}>{type}</span></span>
                <span className="experience-duration">{!entry.finished && start === today ? 'started today' : duration(start, displayEnd || today)}</span>
                {expandable && <span className="experience-toggle" aria-hidden="true" />}
            </Top>
            {expandable && <div className="experience-detail">
                {summary && <p>{summary}</p>}
                {links?.length > 0 && <ul className="experience-links">{links.map(link =>
                    <li key={link.url}><a className="text-link" href={link.url}>{link.label}</a></li>)}</ul>}
                {expected && <p>{type === 'education' ? 'Expected graduation' : 'Expected completion'} · <time dateTime={expected}>{formatDate(expected)}</time></p>}
                {employerSince && <p>At {organizationName} since <time dateTime={employerSince}>{formatDate(employerSince)}</time></p>}
                {transitions.map(change => <Promotion key={change.to.id} change={change} entry={entry} />)}
                {alongside.length > 0 && <div className="experience-meanwhile">
                    <h3>meanwhile</h3>
                    {alongside.map(group => <div className="experience-overlap-group" key={group.key}>
                        {group.organization && <strong>{group.organization}</strong>}
                        <ul>{group.roles.map(role => <li key={role.id}>
                            <span>{role.title}</span><span className="experience-overlap-dates"><DateRange start={role.start} end={role.end} /></span>
                        </li>)}</ul>
                    </div>)}
                </div>}
            </div>}
        </Tile>
    );
}

export default function Experience() {
    const today = useChicagoDate();
    const sections = experienceAt(experience, today);
    return (
        <div className="page-container experience-page">
            <h1 className="section-title">experience</h1>
            {Object.entries(sections).filter(([, entries]) => entries.length).map(([heading, entries]) =>
                <section className="experience-section" key={heading} aria-labelledby={'experience-' + heading + '-heading'}>
                    <h2 id={'experience-' + heading + '-heading'}>{heading}</h2>
                    <div className="experience-sheet">{entries.map(entry => <Entry key={entry.id} entry={entry} today={today} />)}</div>
                </section>)}
        </div>
    );
}
