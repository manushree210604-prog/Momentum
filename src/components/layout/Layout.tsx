import { Outlet } from 'react-router-dom';
import { Sidebar, HamburgerButton } from './Sidebar';
import { useState, useEffect, useCallback } from 'react';
import { CommandPalette } from '../CommandPalette';
import { FocusMode } from '../FocusMode';
import { Zap, Focus } from 'lucide-react';

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [focusOpen, setFocusOpen] = useState(false);

    // ⌘K / Ctrl+K to open command palette
    const handleKeydown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setPaletteOpen(p => !p);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
            e.preventDefault();
            setFocusOpen(p => !p);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [handleKeydown]);

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'hsl(var(--bg-primary))', color: 'hsl(var(--text-primary))', fontFamily: 'inherit' }}>
            {/* Hamburger — mobile only */}
            <HamburgerButton onClick={() => setSidebarOpen(true)} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <main className="flex-1 lg:ml-72 p-6 sm:p-10 lg:p-12 pt-24 lg:pt-12 overflow-y-auto min-w-0">
                <div className="max-w-[1400px] mx-auto pb-24">
                    <Outlet />
                </div>
            </main>

            {/* Floating action bar (bottom right) */}
            <div style={{
                position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
                display: 'flex', flexDirection: 'column', gap: 12,
            }}>
                {/* Focus Mode button */}
                <button
                    onClick={() => setFocusOpen(true)}
                    title="Focus Mode (Ctrl+F)"
                    style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'linear-gradient(135deg, #020617, #0f0a1e)',
                        border: '2px solid rgba(99,102,241,0.3)',
                        color: '#818CF8', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)',
                        transition: 'transform 300ms, box-shadow 300ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(99,102,241,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)'; }}
                >
                    <Focus size={22} strokeWidth={2.5} />
                </button>

                {/* Command Palette button */}
                <button
                    onClick={() => setPaletteOpen(true)}
                    title="Command Palette (Ctrl+K)"
                    style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        border: 'none', color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
                        transition: 'transform 300ms, box-shadow 300ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1) rotate(-5deg)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 16px 48px rgba(99,102,241,0.6)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) rotate(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; }}
                >
                    <Zap size={22} strokeWidth={2.5} fill="white" />
                </button>
            </div>

            {/* Global overlays */}
            <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
            <FocusMode isOpen={focusOpen} onClose={() => setFocusOpen(false)} />
        </div>
    );
}
