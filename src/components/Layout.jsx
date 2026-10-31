import { useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router';
import { syncRouteMetadata } from '../metadata';

const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Resume', path: '/resume.pdf', external: true },
    { name: 'Extras', path: '/extras' },
];

const Layout = () => {
    const { pathname } = useLocation();
    const isHome = pathname === '/';

    useEffect(() => {
        syncRouteMetadata(pathname);
    }, [pathname]);

    return (
        <div className="app-container">
            <a href="#main-content" className="skip-link">Skip to content</a>

            <nav className="top-nav" aria-label="Main">
                {!isHome && (
                    <Link to="/" className="nav-home-link">Home</Link>
                )}

                <div className="nav-links">
                    {navLinks.map(link => (
                        link.external ? (
                            <a key={link.name} href={link.path} target="_blank" rel="noopener noreferrer" className="nav-link">
                                {link.name}
                            </a>
                        ) : (
                            <NavLink key={link.name} to={link.path} end className="nav-link">
                                {link.name}
                            </NavLink>
                        )
                    ))}
                </div>
            </nav>

            <main id="main-content" className="main-content" tabIndex={-1}>
                <Outlet />
            </main>

            <footer className="site-footer">
                <p>© {new Date().getFullYear()} Kyle Honke. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;

