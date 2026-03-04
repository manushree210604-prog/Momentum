import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, BarChart2, Target, Zap } from 'lucide-react';
import { useDataContext } from '../../contexts/DataContext';

export function Sidebar() {
    const { stats } = useDataContext();

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col h-screen fixed top-0 left-0">
            <div className="flex items-center gap-3 mb-10">
                <div className="bg-accent/20 p-2 rounded-xl text-accent">
                    <Zap size={24} className="fill-current" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Momentum</h1>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem to="/" icon={<Home size={20} />} label="Overview" />
                <NavItem to="/habits" icon={<CheckSquare size={20} />} label="Habits" />
                <NavItem to="/goals" icon={<Target size={20} />} label="Goals" />
                <NavItem to="/reports" icon={<BarChart2 size={20} />} label="Reports" />
            </nav>

            <div className="mt-auto momentum-card bg-slate-800/50 border-none p-4">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-sm text-slate-400 font-medium">Lvl {stats.level}</p>
                    <p className="text-xs text-slate-500 font-medium">{stats.xp} XP</p>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent transition-all duration-500 rounded-full"
                        style={{ width: `${(stats.xp % 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
            }
        >
            {icon}
            <span>{label}</span>
            {label === 'Habits' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-success opacity-80" />
            )}
        </NavLink>
    );
}
