import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, BarChart2, Target, Zap, X, Menu, TrendingUp, LogOut } from 'lucide-react';
import { useDataContext } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ThemeToggle';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { stats } = useDataContext();
    const { user, logout } = useAuth();

    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const xpInLevel = stats.xp % 100;
    const xpToNext = 100 - xpInLevel;

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/70 backdrop-blur-md lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen w-72 flex flex-col',
                    // Structural glass
                    'bg-white/70 dark:bg-slate-950/80 backdrop-blur-3xl',
                    'border-r-2 border-slate-100 dark:border-white/[0.04]',
                    // Shadow
                    'shadow-[4px_0_40px_-8px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_60px_-8px_rgba(0,0,0,0.6)]',
                    // Mobile slide animation
                    'transition-[transform] duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
                    'lg:translate-x-0 lg:z-auto',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
                aria-label="Main navigation"
            >
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-violet-500 to-transparent" />

                {/* Subtle noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

                <div className="relative flex flex-col h-full p-6">
                    {/* ── Logo ── */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3.5 group cursor-pointer">
                            <div className="relative">
                                {/* Glow halo */}
                                <div className="absolute -inset-2 bg-gradient-to-br from-accent to-violet-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg">
                                    <Zap size={22} className="text-white fill-white" />
                                </div>
                            </div>
                            <div>
                                <span className="block text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                                    Momentum
                                </span>
                                <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-accent leading-none mt-1">
                                    Habit OS
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl
                                       bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400
                                       hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white
                                       border border-slate-200 dark:border-white/5"
                            aria-label="Close menu"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* ── Section Label ── */}
                    <div className="px-4 mb-3">
                        <span className="section-label">Navigation</span>
                    </div>

                    {/* ── Nav links ── */}
                    <nav className="flex-1 space-y-1" role="navigation">
                        <NavItem to="/" icon={<Home size={19} strokeWidth={2.5} />} label="Overview" onClick={onClose} />
                        <NavItem to="/habits" icon={<CheckSquare size={19} strokeWidth={2.5} />} label="Habits" onClick={onClose}>
                            <div className="ml-auto flex items-center">
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-success" />
                                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-pulse-ring" />
                                </div>
                            </div>
                        </NavItem>
                        <NavItem to="/goals" icon={<Target size={19} strokeWidth={2.5} />} label="Goals" onClick={onClose} />
                        <NavItem to="/reports" icon={<BarChart2 size={19} strokeWidth={2.5} />} label="Reports" onClick={onClose} />
                    </nav>

                    {/* ── Divider ── */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent my-6" />

                    {/* ── Bottom section ── */}
                    <div className="space-y-5">
                        {/* Theme toggle */}
                        <div className="flex items-center justify-between px-4">
                            <div>
                                <span className="section-label mb-0">Interface</span>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Theme Mode</span>
                            </div>
                            <ThemeToggle />
                        </div>

                        {/* XP / Level card */}
                        <div className="rounded-2xl border-2 border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.02] overflow-hidden relative group shimmer-scan">
                            {/* Top glow */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-violet-500 opacity-50" />

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="min-w-0 flex-1">
                                        <span className="section-label mb-0.5">Operator Profile</span>
                                        {user && (
                                            <p className="text-[11px] font-black text-accent truncate tracking-wide leading-none mb-1.5">
                                                {user.display_name}
                                            </p>
                                        )}
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                                                LVL {stats.level}
                                            </p>
                                            <TrendingUp size={14} className="text-accent mb-0.5" strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl animate-float flex-shrink-0">
                                        <p className="text-[10px] text-accent font-black tracking-widest leading-none">{stats.xp} XP</p>
                                    </div>
                                </div>

                                {/* XP Bar */}
                                <div className="relative h-2 w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                                    <div
                                        className="h-full rounded-full animate-xp-fill
                                                   bg-gradient-to-r from-accent via-violet-500 to-indigo-500
                                                   shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                                        style={{ width: `${xpInLevel}%` }}
                                    />
                                    {/* Scanning pulse */}
                                    <div className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                                         style={{ left: `${xpInLevel - 3}%`, transition: 'left 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s' }} />
                                </div>

                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-black tracking-widest uppercase text-center">
                                    <span className="text-accent">{xpToNext} XP</span> to next level
                                </p>
                            </div>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={logout}
                            id="sidebar-logout-btn"
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                                'border-2 border-red-500/10 bg-red-500/5',
                                'text-red-400/70 hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/10',
                                'font-black text-[10px] tracking-[0.25em] uppercase',
                                'transition-all duration-300 group'
                            )}
                            aria-label="Terminate session and log out"
                        >
                            <LogOut size={15} strokeWidth={2.5} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                            Terminate Session
                        </button>
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
                    'group relative flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold tracking-tight text-sm',
                    'transition-all duration-300',
                    isActive
                        ? 'bg-accent/10 dark:bg-accent/10 text-accent'
                        : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                )
            }
        >
            {({ isActive }) => (
                <>
                    {/* Active left pip */}
                    {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-xl bg-accent
                                        shadow-[2px_0_12px_rgba(99,102,241,0.5)]" />
                    )}

                    {/* Icon container */}
                    <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-all duration-300',
                        isActive
                            ? 'bg-accent/10 border-accent/20 text-accent'
                            : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-400 dark:text-slate-600 group-hover:border-slate-300 dark:group-hover:border-white/10 group-hover:text-slate-700 dark:group-hover:text-white'
                    )}>
                        {icon}
                    </div>

                    <span className="flex-1 leading-none">{label}</span>
                    {children}

                    {/* Hover arrow */}
                    {!isActive && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 dark:text-slate-700 -translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                            →
                        </div>
                    )}
                </>
            )}
        </NavLink>
    );
}

// ─── Hamburger button ─────────────────────────────────────────────────────────
export function HamburgerButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden fixed top-5 left-5 z-50 w-11 h-11 flex items-center justify-center
                       bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl
                       border-2 border-slate-100 dark:border-white/[0.06]
                       rounded-xl text-slate-500 dark:text-slate-400
                       hover:text-accent hover:border-accent/30
                       shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            aria-label="Open menu"
        >
            <Menu size={20} strokeWidth={2.5} />
        </button>
    );
}
