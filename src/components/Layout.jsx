import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/layout.css';

const Layout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Projects', path: '/projects' },
        { name: 'Resume', path: '/resume.pdf', external: true },
        { name: 'Extras', path: '/extras' },
    ];

    return (
        <div className="app-container">


            <nav className="top-nav">
                {!isHome && (
                    <Link to="/" className="nav-home-link">Home</Link>
                )}

                <div className="nav-links">
                    {navLinks.map(link => (
                        link.external ? (
                            <a
                                key={link.name}
                                href={link.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nav-link"
                            >
                                {link.name}
                            </a>
                        ) : (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                {link.name}
                            </Link>
                        )
                    ))}
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="site-footer">
                <p>© 2026 Kyle Honke. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
