import { useEffect, useState } from 'react';

export interface XpToast {
    id: number;
    amount: number;
    x: number;
    y: number;
}

interface XpParticleProps {
    toast: XpToast;
    onDone: (id: number) => void;
}

export function XpParticle({ toast, onDone }: XpParticleProps) {
    const [opacity, setOpacity] = useState(1);
    const [ty, setTy] = useState(0);

    useEffect(() => {
        // Animate up
        requestAnimationFrame(() => {
            setTy(-80);
            setOpacity(0);
        });
        const t = setTimeout(() => onDone(toast.id), 1200);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                left: toast.x,
                top: toast.y,
                transform: `translateY(${ty}px) translateX(-50%)`,
                opacity,
                zIndex: 9999,
                pointerEvents: 'none',
                transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 1.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            }}
        >
            <div style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                padding: '5px 12px',
                borderRadius: 999,
                boxShadow: '0 8px 24px rgba(99,102,241,0.5)',
                fontStyle: 'italic',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
            }}>
                +{toast.amount} XP ⚡
            </div>
        </div>
    );
}
