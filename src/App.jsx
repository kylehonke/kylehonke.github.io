import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Extras from './pages/Extras';
import NotFound from './pages/NotFound';
import Gaming from './pages/extras/Gaming';
import Storm from './pages/extras/Storm';
import Lego from './pages/extras/Lego';
import Music from './pages/extras/Music';
import Food from './pages/extras/Food';
import { routes } from './routes';

const pages = {
    '/': Home,
    '/about': About,
    '/projects': Projects,
    '/extras': Extras,
    '/extras/gaming': Gaming,
    '/extras/storm': Storm,
    '/extras/lego': Lego,
    '/extras/music': Music,
    '/extras/food': Food,
};

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const App = () => (
    <BrowserRouter>
        <ScrollToTop />
        <Routes>
            <Route path="/" element={<Layout />}>
                {routes.map(({ path }) => {
                    const Page = pages[path];
                    return path === '/'
                        ? <Route key={path} index element={<Page />} />
                        : <Route key={path} path={path.slice(1)} element={<Page />} />;
                })}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    </BrowserRouter>
);

export default App;
