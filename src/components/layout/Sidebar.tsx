import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, BarChart2, Target, Zap, X, Menu } from 'lucide-react';
import { useDataContext } from '../../contexts/DataContext';
import { ThemeToggle } from '../ThemeToggle';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { stats } = useDataContext();

    // Close sidebar on initial mount (route change on mobile)
    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const xpInLevel = stats.xp % 100;
    const xpToNext = 100 - xpInLevel;

    return (
        <>
            {/* Mobile backdrop overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={cn(
                    // Layout
                    'fixed top-0 left-0 z-40 h-screen w-64 flex flex-col p-6',
                    // Light / dark backgrounds
                    'bg-[var(--bg-sidebar)] border-r border-slate-200 dark:border-slate-800',
                    // Mobile slide
                    'transition-transform duration-300 ease-in-out',
                    'lg:translate-x-0 lg:z-auto',
                    isOpen ? 'translate-x-0 shadow-2xl shadow-black/30' : '-translate-x-full'
                )}
                aria-label="Main navigation"
            >
                {/* ── Logo row ── */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-accent/20 p-2 rounded-xl text-accent">
                            <Zap size={24} className="fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Momentum
                        </span>
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Nav links ── */}
                <nav className="flex-1 space-y-1" role="navigation">
                    <NavItem to="/" icon={<Home size={20} />} label="Overview" onClick={onClose} />
                    <NavItem to="/habits" icon={<CheckSquare size={20} />} label="Habits" onClick={onClose}>
                        <span className="ml-auto w-2 h-2 rounded-full bg-success opacity-80" />
                    </NavItem>
                    <NavItem to="/goals" icon={<Target size={20} />} label="Goals" onClick={onClose} />
                    <NavItem to="/reports" icon={<BarChart2 size={20} />} label="Reports" onClick={onClose} />
                </nav>

                {/* ── Bottom section ── */}
                <div className="mt-auto space-y-4">
                    {/* Theme toggle row */}
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Appearance
                        </span>
                        <ThemeToggle />
                    </div>

                    {/* XP / Level card */}
                    <div className="rounded-2xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/30">
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Lvl {stats.level}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                                {stats.xp} XP
                            </p>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent to-violet-400 transition-all duration-700 rounded-full"
                                style={{ width: `${xpInLevel}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 font-medium">
                            {xpToNext} XP to next level
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}

// ─── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({
    to,
    icon,
    label,
    onClick,
    children,
}: {
    to: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    children?: React.ReactNode;
}) {
    return (
        <NavLink
            to={to}
            end={to === '/'}
            onClick={onClick}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                )
            }
        >
            {icon}
            <span>{label}</span>
            {children}
        </NavLink>
    );
}

// ─── Hamburger button (exported for Layout) ───────────────────────────────────
export function HamburgerButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center
                       bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       rounded-xl text-slate-600 dark:text-slate-300
                       hover:text-slate-900 dark:hover:text-white
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-colors shadow-sm dark:shadow-lg"
            aria-label="Open menu"
        >
            <Menu size={20} />
        </button>
    );
}
