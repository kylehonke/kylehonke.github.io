import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Function to set canvas size to full viewport
        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setSize();

        let particles = [];

        const mouse = { x: undefined, y: undefined };

        const handleResize = () => {
            setSize();
        };

        const handleMouseMove = (e) => {
            // e.clientX/Y gives coordinate within viewport (which is what fixed canvas expects)
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            particles.push(new Particle());
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        class Particle {
            constructor() {
                this.x = mouse.x;
                this.y = mouse.y;
                this.size = Math.random() * 8 + 2;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;

                // Seafoam/Pastel Palette
                const colors = ['rgba(94, 234, 212, 0.4)', 'rgba(191, 219, 254, 0.4)', 'rgba(251, 207, 232, 0.4)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.life = 60;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.1;
                this.life--;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                if (particles[i].life <= 0 || particles[i].size <= 0.1) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999 /* Ensure checks */
            }}
        />
    );
};

export default MouseTrail;
