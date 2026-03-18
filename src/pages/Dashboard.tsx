import { useDataContext } from '../contexts/DataContext';
import { useMemo } from 'react';
import { format, subDays, isSameWeek, isSameMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, Activity, CheckCircle, CalendarDays, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
    const { habits, stats } = useDataContext();

    const totalHabits = habits.length;

    const { activeStreak, weeklyCompletion, monthlyCompletion, weeklyData } = useMemo(() => {
        let streak = 0;
        habits.forEach(h => { if (h.currentStreak > streak) streak = h.currentStreak; });

        const now = new Date();
        let thisWeekTotal = 0;
        let thisWeekCompleted = 0;
        let thisMonthTotal = 0;
        let thisMonthCompleted = 0;

        const weeklyStats = [6, 5, 4, 3, 2, 1, 0].map(diff => ({
            name: format(subDays(now, diff), 'EEE'),
            dateStr: format(subDays(now, diff), 'yyyy-MM-dd'),
            completed: 0,
        }));

        habits.forEach(h => {
            thisWeekTotal += 7;
            thisMonthTotal += 30;
            h.completedDates.forEach(dStr => {
                const d = new Date(dStr);
                if (isSameWeek(d, now)) thisWeekCompleted++;
                if (isSameMonth(d, now)) thisMonthCompleted++;
                const wIdx = weeklyStats.findIndex(w => w.dateStr === dStr);
                if (wIdx !== -1) weeklyStats[wIdx].completed++;
            });
        });

        return {
            activeStreak: streak,
            weeklyCompletion: thisWeekTotal ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0,
            monthlyCompletion: thisMonthTotal ? Math.round((thisMonthCompleted / thisMonthTotal) * 100) : 0,
            weeklyData: weeklyStats,
        };
    }, [habits]);

    // Read CSS variables at render time for Recharts props
    const chartStyle = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const chartColor = chartStyle?.getPropertyValue('--chart-1').trim() || '#8B5CF6';
    const tooltipBg = chartStyle?.getPropertyValue('--chart-tooltip-bg').trim() || '#1E293B';
    const tooltipBorder = chartStyle?.getPropertyValue('--chart-tooltip-border').trim() || '#334155';
    const tooltipText = chartStyle?.getPropertyValue('--chart-tooltip-text').trim() || '#f8fafc';
    const axisTick = chartStyle?.getPropertyValue('--chart-axis-stroke').trim() || '#475569';
    const cursorFill = chartStyle?.getPropertyValue('--chart-cursor').trim() || 'rgba(30,41,59,0.5)';

    return (
        <div className="space-y-12 animate-box-in">
            {/* ── Header ── */}
            <header className="flex justify-between items-end mb-16 px-2">
                <div>
                   <span className="section-label">Operations Console</span>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white leading-none">
                        Dashboard
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold tracking-tight italic opacity-80">Build your legacy, one discipline at a time.</p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02]">
                        <span className="section-label mb-1">System Status</span>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-success" />
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-pulse-ring" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Active · Online</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="animate-card-1 h-full">
                    <StatCard icon={<Activity size={26} strokeWidth={2.5} />} label="Total Habits" value={totalHabits} color="text-accent" bgColor="bg-accent/5 border-accent/10" />
                </div>
                <div className="animate-card-2 h-full">
                    <StatCard icon={<Flame size={26} strokeWidth={2.5} />} label="Active Streak" value={activeStreak} suffix="d" color="text-warning" bgColor="bg-warning/5 border-warning/10" />
                </div>
                <div className="animate-card-3 h-full">
                    <StatCard icon={<CheckCircle size={26} strokeWidth={2.5} />} label="Weekly Yield" value={weeklyCompletion} suffix="%" color="text-success" bgColor="bg-success/5 border-success/10" />
                </div>
                <div className="animate-card-4 h-full">
                    <StatCard icon={<CalendarDays size={26} strokeWidth={2.5} />} label="Monthly Avg" value={monthlyCompletion} suffix="%" color="text-blue-500" bgColor="bg-blue-500/5 border-blue-500/10" />
                </div>
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar chart */}
                <div className="lg:col-span-2 momentum-card group">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <span className="section-label">Performance Metrics</span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                Weekly Yield Analysis
                            </h3>
                        </div>
                        <div className="px-4 py-2 border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                            Cycle-7D
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <XAxis
                                    dataKey="name"
                                    stroke={axisTick}
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    dy={15}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: cursorFill, radius: 12 }}
                                    contentStyle={{
                                        backgroundColor: tooltipBg,
                                        borderColor: tooltipBorder,
                                        borderRadius: '16px',
                                        color: tooltipText,
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(20px)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}
                                />
                                <Bar dataKey="completed" fill={chartColor} radius={[6, 6, 6, 6]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quote card */}
                <div className="momentum-card flex flex-col items-center justify-center text-center group overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-0 group-hover:opacity-100" style={{ transition: 'opacity 700ms ease' }} />
                    <div className="absolute bottom-0 left-0 w-28 h-28 bg-violet-500/5 rounded-full -ml-14 -mb-14 blur-2xl" />
                    <div className="relative stat-card-icon mb-10 text-accent bg-accent/5 border-accent/10 w-16 h-16 rounded-2xl animate-float">
                        <Sparkles size={28} strokeWidth={3} />
                    </div>
                    <span className="section-label">Philosophical Core</span>
                    <h3 className="text-xl font-black italic mb-8 text-slate-800 dark:text-white leading-relaxed tracking-tight">
                        "Small disciplines repeated with consistency lead to great achievements."
                    </h3>
                    <div className="w-10 h-0.5 bg-gradient-to-r from-accent to-violet-500 mb-6 rounded-full" />
                    <p className="text-slate-400 dark:text-slate-600 font-black text-[10px] tracking-[0.35em] uppercase italic">— John C. Maxwell</p>
                </div>
            </div>

            {/* ── Insight banner ── */}
            {weeklyCompletion < 50 && totalHabits > 0 && (
                <div className="momentum-card border-warning/20 bg-warning/[0.025] flex items-center gap-8 py-8 shimmer-scan">
                    <div className="stat-card-icon bg-warning/10 border-warning/20 text-warning w-16 h-16 rounded-2xl flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Activity size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                        <span className="section-label text-warning/70">Critical Yield Alert</span>
                        <h4 className="text-warning font-black text-2xl mb-2 uppercase italic tracking-tighter">Velocity Drop Detected</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-bold italic tracking-tight text-base opacity-80">
                            Yield is below 50%. Force-push a micro-habit today to restore momentum.
                        </p>
                    </div>
                    <div className="hidden lg:flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="text-5xl font-black italic tracking-tighter text-warning">{weeklyCompletion}<span className="text-2xl opacity-30">%</span></div>
                        <span className="section-label text-warning/50 mb-0">Current Yield</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, suffix, color, bgColor }: { icon: React.ReactNode; label: string; value: string | number; suffix?: string; color: string; bgColor?: string }) {
    return (
        <div className="momentum-card flex flex-col items-start gap-8 group h-full">
            <div className={cn("stat-card-icon", color, bgColor ?? "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5")}>
                {icon}
            </div>
            <div className="w-full">
                <span className="section-label">{label}</span>
                <div className="flex items-baseline gap-2 animate-number-pop">
                    <p className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white italic leading-none">{value}</p>
                    {suffix && <span className={cn("text-lg font-black italic opacity-30 tracking-tight", color)}>{suffix}</span>}
                </div>
            </div>
            <div className={cn("absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full rounded-full", color.replace('text-','bg-'))} style={{ transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)' }} />
        </div>
    );
}
