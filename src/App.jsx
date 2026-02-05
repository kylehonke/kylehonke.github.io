import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Extras from './pages/Extras';
import Gaming from './pages/extras/Gaming';
import Storm from './pages/extras/Storm';
import Lego from './pages/extras/Lego';
import Music from './pages/extras/Music';
import Food from './pages/extras/Food';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const App = () => {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="extras" element={<Extras />} />
                    <Route path="extras/gaming" element={<Gaming />} />
                    <Route path="extras/storm" element={<Storm />} />
                    <Route path="extras/lego" element={<Lego />} />
                    <Route path="extras/music" element={<Music />} />
                    <Route path="extras/food" element={<Food />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
