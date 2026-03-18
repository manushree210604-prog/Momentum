import { useEffect, useRef } from 'react';

interface ConfettiProps {
    active: boolean;
    onDone: () => void;
}

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#ffffff'];

export function Confetti({ active, onDone }: ConfettiProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const count = 180;
        type Particle = {
            x: number; y: number; vx: number; vy: number;
            color: string; size: number; rotation: number; rotSpeed: number;
            shape: 'rect' | 'circle' | 'star'; opacity: number;
        };

        const particles: Particle[] = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 4 + 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 12 + 5,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2,
            shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
            opacity: 1,
        }));

        let elapsed = 0;

        const drawStar = (cx: number, cy: number, r: number) => {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            elapsed++;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12; // gravity
                p.vx *= 0.99; // drag
                p.rotation += p.rotSpeed;
                if (elapsed > 80) p.opacity = Math.max(0, p.opacity - 0.015);

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    drawStar(0, 0, p.size / 2);
                    ctx.fill();
                }
                ctx.restore();
            });

            const anyVisible = particles.some(p => p.opacity > 0);
            if (anyVisible) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                onDone();
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [active, onDone]);

    if (!active) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                pointerEvents: 'none', width: '100vw', height: '100vh',
            }}
        />
    );
}
