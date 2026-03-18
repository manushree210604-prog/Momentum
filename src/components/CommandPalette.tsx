import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import { Home, CheckSquare, Target, BarChart2, Zap, Search, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const ROUTES = [
    { label: 'Dashboard', path: '/', icon: <Home size={16} strokeWidth={2.5} />, description: 'Overview & stats' },
    { label: 'Habits', path: '/habits', icon: <CheckSquare size={16} strokeWidth={2.5} />, description: 'Manage rituals' },
    { label: 'Goals', path: '/goals', icon: <Target size={16} strokeWidth={2.5} />, description: 'Track objectives' },
    { label: 'Reports', path: '/reports', icon: <BarChart2 size={16} strokeWidth={2.5} />, description: 'Performance data' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const { habits, goals } = useDataContext();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const allItems = [
        ...ROUTES.map(r => ({ ...r, type: 'nav' as const })),
        ...habits.map(h => ({
            label: h.title,
            path: '/habits',
            icon: <CheckSquare size={16} strokeWidth={2.5} />,
            description: `${h.category} · ${h.currentStreak} day streak`,
            type: 'habit' as const,
        })),
        ...goals.map(g => ({
            label: g.title,
            path: '/goals',
            icon: <Target size={16} strokeWidth={2.5} />,
            description: `${g.category} · ${g.progress}% complete`,
            type: 'goal' as const,
        })),
    ];

    const filtered = query
        ? allItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
        : allItems;

    const go = useCallback((path: string) => {
        navigate(path);
        setQuery('');
        setSelected(0);
        onClose();
    }, [navigate, onClose]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setSelected(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
            if (e.key === 'Enter' && filtered[selected]) go(filtered[selected].path);
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, filtered, selected, go, onClose]);

    if (!isOpen) return null;

    const typeColor = (type: string) => ({
        nav: 'text-accent',
        habit: 'text-success',
        goal: 'text-warning',
    }[type] ?? 'text-slate-400');

    const typeLabel = (type: string) => ({
        nav: 'Navigate',
        habit: 'Habit',
        goal: 'Goal',
    }[type] ?? '');

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
                style={{
                    background: '#fff',
                    border: '2px solid rgba(99,102,241,0.15)',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)',
                    animation: 'cmdPalette 0.2s cubic-bezier(0.16,1,0.3,1) both'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Input */}
                <div className="flex items-center px-6 py-4 border-b-2 border-slate-100">
                    <Search size={20} className="text-slate-300 mr-4 flex-shrink-0" strokeWidth={2.5} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelected(0); }}
                        placeholder="Search habits, goals, pages..."
                        style={{
                            flex: 1, border: 'none', outline: 'none', fontSize: '1rem',
                            fontWeight: 700, color: '#0f172a', background: 'transparent',
                            fontFamily: 'inherit'
                        }}
                    />
                    <div className="flex items-center gap-1 ml-4">
                        <kbd style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 6px', fontSize: 11, fontWeight: 700, color: '#64748b' }}>ESC</kbd>
                    </div>
                </div>

                {/* Results */}
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    {filtered.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, fontStyle: 'italic' }}>
                            No results for "{query}"
                        </div>
                    ) : (
                        <div style={{ padding: '8px' }}>
                            {filtered.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => go(item.path)}
                                    onMouseEnter={() => setSelected(i)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '12px 16px', borderRadius: '10px', border: 'none',
                                        background: i === selected ? '#f8fafc' : 'transparent',
                                        cursor: 'pointer', textAlign: 'left',
                                        borderLeft: i === selected ? '3px solid #6366F1' : '3px solid transparent',
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#6366F1' }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 900, fontSize: '0.875rem', color: '#0f172a', fontStyle: 'italic' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginTop: 2 }}>{item.description}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}
                                              className={typeColor(item.type)}>
                                            {typeLabel(item.type)}
                                        </span>
                                        {i === selected && <ArrowRight size={14} color="#6366F1" strokeWidth={3} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 16 }}>
                    {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <kbd style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700, color: '#475569' }}>{k}</kbd>
                            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>{v}</span>
                        </div>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: '#6366F1' }}>
                        <Zap size={12} fill="currentColor" />
                        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Momentum OS</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes cmdPalette {
                    from { transform: translateY(-20px) scale(0.97); opacity: 0; }
                    to   { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
