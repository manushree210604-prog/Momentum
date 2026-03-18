import { useState, useEffect } from 'react';
import { useDataContext } from '../contexts/DataContext';
import { format } from 'date-fns';
import { X, Check, Zap, Target, Flame, ChevronRight } from 'lucide-react';

interface FocusModeProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FocusMode({ isOpen, onClose }: FocusModeProps) {
    const { habits, toggleHabitDate } = useDataContext();
    const today = format(new Date(), 'yyyy-MM-dd');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [flash, setFlash] = useState(false);

    const pending = habits.filter(h => !h.completedDates.includes(today));
    const done    = habits.filter(h => h.completedDates.includes(today));
    const total   = habits.length;
    const pct     = total ? Math.round((done.length / total) * 100) : 0;

    const current = pending[currentIdx] ?? null;

    useEffect(() => {
        if (isOpen) setCurrentIdx(0);
    }, [isOpen]);

    const complete = () => {
        if (!current) return;
        setFlash(true);
        toggleHabitDate(current.id, today);
        setTimeout(() => {
            setFlash(false);
            // move to next (pending list shrinks automatically)
            setCurrentIdx(0);
        }, 600);
    };

    const skip = () => {
        setCurrentIdx(i => Math.min(i + 1, pending.length - 1));
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Enter' || e.key === ' ') complete();
            if (e.key === 'ArrowRight') skip();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, current]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'linear-gradient(135deg, #020617 0%, #0f0a1e 40%, #0c1a2e 100%)',
                display: 'flex', flexDirection: 'column',
                animation: 'focusIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
            }}
        >
            <style>{`
                @keyframes focusIn {
                    from { opacity: 0; transform: scale(1.03); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes habitSlide {
                    from { transform: translateX(40px); opacity: 0; }
                    to   { transform: translateX(0); opacity: 1; }
                }
                @keyframes flashGreen {
                    0%, 100% { background: transparent; }
                    50% { background: rgba(16,185,129,0.15); }
                }
                @keyframes pulseRing2 {
                    0%   { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
            `}</style>

            {/* Ambient background blobs */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)', filter: 'blur(60px)' }} />
            </div>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Zap size={20} color="#6366F1" fill="#6366F1" />
                    <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#6366F1' }}>Focus Mode</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: '#94a3b8', fontSize: 12, fontWeight: 700 }}>
                        <span style={{ color: '#10B981', fontWeight: 900, fontSize: 14 }}>{done.length}</span>
                        <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span>
                        <span>{total}</span>
                        <span style={{ marginLeft: 4, opacity: 0.5 }}>completed</span>
                    </div>
                    <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', margin: 0 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, #6366F1, #10B981)', transition: 'width 800ms cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }} />
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', animation: flash ? 'flashGreen 0.6s ease' : 'none' }}>
                {current ? (
                    <div style={{ textAlign: 'center', animation: 'habitSlide 0.4s cubic-bezier(0.16,1,0.3,1) both', maxWidth: 640 }}>
                        {/* Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: '2rem' }}>
                            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#818CF8' }}>{current.category}</span>
                            {current.currentStreak > 0 && (
                                <>
                                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>·</span>
                                    <Flame size={11} color="#F59E0B" fill="#F59E0B" />
                                    <span style={{ fontSize: 10, fontWeight: 900, color: '#F59E0B', fontStyle: 'italic' }}>{current.currentStreak}d</span>
                                </>
                            )}
                        </div>

                        {/* Big title */}
                        <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.04em', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '1.5rem', textShadow: '0 0 60px rgba(99,102,241,0.3)' }}>
                            {current.title}
                        </h2>

                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '3rem' }}>
                            {pending.length} ritual{pending.length !== 1 ? 's' : ''} remaining
                        </p>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
                            <button
                                onClick={complete}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                    color: '#fff', border: 'none', borderRadius: 16,
                                    padding: '1.25rem 3rem', fontSize: '1rem', fontWeight: 900,
                                    textTransform: 'uppercase', letterSpacing: '0.2em',
                                    cursor: 'pointer', fontStyle: 'italic',
                                    boxShadow: '0 20px 60px rgba(99,102,241,0.4)',
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                <Check size={24} strokeWidth={3.5} />
                                Mark Done
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
                            </button>
                            {pending.length > 1 && (
                                <button
                                    onClick={skip}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                                        padding: '1.25rem 2rem', fontSize: '0.875rem', fontWeight: 900,
                                        textTransform: 'uppercase', letterSpacing: '0.2em',
                                        cursor: 'pointer', fontStyle: 'italic',
                                    }}
                                >
                                    Skip <ChevronRight size={18} strokeWidth={3} />
                                </button>
                            )}
                        </div>

                        {/* Keyboard hint */}
                        <div style={{ marginTop: '2rem', display: 'flex', gap: 12, justifyContent: 'center' }}>
                            {[['Enter', 'Complete'], ['→', 'Skip'], ['Esc', 'Exit']].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <kbd style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{k}</kbd>
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* All done state */
                    <div style={{ textAlign: 'center', animation: 'habitSlide 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                        <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>🏆</div>
                        <h2 style={{ fontSize: '4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '1rem' }}>
                            Mission Complete!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', fontWeight: 700, fontStyle: 'italic', marginBottom: '3rem' }}>
                            All {total} rituals executed. You're unstoppable.
                        </p>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '3rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981', fontStyle: 'italic' }}>{total}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Completed</div>
                            </div>
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6366F1', fontStyle: 'italic' }}>+{total * 20}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>XP Earned</div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '1rem 2.5rem', fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', fontStyle: 'italic' }}
                        >
                            Return to Base
                        </button>
                    </div>
                )}

                {/* Done list at bottom */}
                {done.length > 0 && current && (
                    <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                        {done.map(h => (
                            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999, padding: '4px 12px' }}>
                                <Check size={10} color="#10B981" strokeWidth={4} />
                                <span style={{ fontSize: 10, fontWeight: 900, color: '#10B981', letterSpacing: '0.05em' }}>{h.title}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
