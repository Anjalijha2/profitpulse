import React, { useEffect, useRef } from 'react';

export default function WaveCanvas() {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let time = 0;

        const setCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };

        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();

        // Red/Navy theme waves
        const waves = [
            {
                // Background Light Blue wave
                color: [219, 240, 255],
                baseYOffset: 0.55,
                thickness: 400,
                opacity: 0.8,
                components: [
                    { amplitude: 120, frequency: 0.006, speed: 0.005 },
                    { amplitude: 60, frequency: 0.015, speed: -0.010 }
                ]
            },
            {
                // Middle Navy wave
                color: [4, 2, 34],
                baseYOffset: 0.60,
                thickness: 350,
                opacity: 0.1,
                components: [
                    { amplitude: 150, frequency: 0.008, speed: 0.008 },
                    { amplitude: 80, frequency: 0.018, speed: -0.012 },
                    { amplitude: 30, frequency: 0.025, speed: 0.015 }
                ]
            },
            {
                // Foreground Red wave
                color: [241, 26, 16],
                baseYOffset: 0.45,
                thickness: 250,
                opacity: 0.6,
                components: [
                    { amplitude: 140, frequency: 0.009, speed: 0.007 },
                    { amplitude: 90, frequency: 0.020, speed: -0.014 },
                    { amplitude: 40, frequency: 0.030, speed: 0.018 }
                ]
            }
        ];

        // Fill entire screen with dust particles
        const particles = Array.from({ length: 40 }).map(() => ({
            x: Math.random(),
            y: Math.random(),
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.3 + 0.1,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
        }));

        const render = () => {
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);

            // Light clean background
            ctx.globalCompositeOperation = 'source-over';
            const bg = ctx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#FFFFFF'); // White
            bg.addColorStop(1, '#F6F6F6'); // Light Gray
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            // Particles
            particles.forEach(p => {
                p.x += p.speedX / w;
                p.y += p.speedY / h;
                if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(241, 26, 16, ${p.opacity})`;
                ctx.fill();
            });

            // Multiply blending for light theme
            ctx.globalCompositeOperation = 'multiply';

            waves.forEach((wave) => {
                const { color, baseYOffset, thickness, opacity, components } = wave;
                const baseY = h * baseYOffset;
                const step = 4;
                const pts = [];

                for (let x = 0; x <= w + step; x += step) {
                    let y = baseY;
                    components.forEach(c => {
                        y += Math.sin(x * c.frequency + time * c.speed) * c.amplitude;
                    });
                    pts.push({ x, y });
                }

                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                for (let i = pts.length - 1; i >= 0; i--) {
                    const tv = Math.sin(pts[i].x * 0.005 + time * 0.01) * 30;
                    ctx.lineTo(pts[i].x, pts[i].y + thickness + tv);
                }
                ctx.closePath();

                // Vertical gradient fill
                const fillGrad = ctx.createLinearGradient(0, baseY - 200, 0, baseY + thickness);
                fillGrad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${opacity})`);
                fillGrad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
                ctx.fillStyle = fillGrad;
                ctx.fill();

                // Soft Outline
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.5)`;
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            });

            time += 1;
            animRef.current = requestAnimationFrame(render);
        };

        render();
        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', setCanvasSize);
        };
    }, []);

    // Fixed absolute positioned full viewport background
    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -10, width: '100vw', height: '100vh', display: 'block' }} />;
}
