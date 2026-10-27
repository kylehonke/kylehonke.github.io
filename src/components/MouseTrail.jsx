import { useEffect, useRef } from 'react';

// Seafoam/Pastel Palette
const COLORS = ['rgba(94, 234, 212, 0.4)', 'rgba(191, 219, 254, 0.4)', 'rgba(251, 207, 232, 0.4)'];
const PARTICLE_LIFE = 60;

const createParticle = (x, y) => ({
    x,
    y,
    size: Math.random() * 8 + 2,
    speedX: Math.random() * 2 - 1,
    speedY: Math.random() * 2 - 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: PARTICLE_LIFE,
});

const MouseTrail = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let frame = null;

        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles = particles.filter(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                if (particle.size > 0.1) particle.size -= 0.1;
                particle.life--;
                if (particle.life <= 0 || particle.size <= 0.1) return false;

                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                return true;
            });

            // Go idle once the trail has faded; the next mousemove restarts the loop.
            frame = particles.length > 0 ? requestAnimationFrame(animate) : null;
        };

        const handleMouseMove = (e) => {
            particles.push(createParticle(e.clientX, e.clientY));
            if (frame === null) frame = requestAnimationFrame(animate);
        };

        setSize();
        window.addEventListener('resize', setSize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            if (frame !== null) cancelAnimationFrame(frame);
            window.removeEventListener('resize', setSize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="mouse-trail" aria-hidden="true" />;
};

export default MouseTrail;
