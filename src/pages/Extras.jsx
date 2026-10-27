import { Link } from 'react-router';
import { Gamepad2, Cat, Box, Music, Utensils } from 'lucide-react';
import { routes } from '../routes';

const icons = {
    '/extras/gaming': Gamepad2,
    '/extras/storm': Cat,
    '/extras/lego': Box,
    '/extras/music': Music,
    '/extras/food': Utensils,
};

const extras = routes.filter(route => route.path.startsWith('/extras/') && !route.hidden);

const Extras = () => (
    <div className="page-container flex-center extras-page">
        <h1 className="visually-hidden">extras</h1>
        <nav className="extras-list" aria-label="Extras">
            {extras.map(({ path, title }, index) => {
                const Icon = icons[path];
                return (
                    <Link key={path} to={path} className="extras-item" style={{ '--fade-delay': `${index * 0.1}s` }}>
                        <Icon size={28} aria-hidden="true" />
                        <h2>{title}</h2>
                    </Link>
                );
            })}
        </nav>
    </div>
);

export default Extras;
