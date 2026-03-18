import { useDataContext } from '../contexts/DataContext';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Award, Zap, CheckCircle2, XOctagon, Activity } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { cn } from '../lib/utils';

// Read computed CSS variable at call time
function cssVar(name: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function Reports() {
    const { habits } = useDataContext();

    const {
        totalCompleted, missedHabits, completionRate,
        consistencyLevel, longestStreak, categoryData, trendData
    } = useMemo(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });

        let totalComp = 0;
        let missed = 0;
        let bestStreak = 0;
        const catMap: Record<string, number> = {};

        const trends = Array.from({ length: 14 }).map((_, i) => ({
            name: format(subDays(now, 13 - i), 'MMM dd'),
            dateStr: format(subDays(now, 13 - i), 'yyyy-MM-dd'),
            count: 0,
        }));

        habits.forEach(h => {
            if (h.longestStreak > bestStreak) bestStreak = h.longestStreak;
            let weeklyActual = 0;
            h.completedDates.forEach(dStr => {
                const d = new Date(dStr);
                if (isWithinInterval(d, { start, end })) { weeklyActual++; totalComp++; }
                catMap[h.category] = (catMap[h.category] || 0) + 1;
                const tIdx = trends.findIndex(t => t.dateStr === dStr);
                if (tIdx !== -1) trends[tIdx].count++;
            });
            missed += (7 - weeklyActual);
        });

        const expectedTotal = habits.length * 7;
        const rate = expectedTotal ? Math.round((totalComp / expectedTotal) * 100) : 0;
        let level = 'Beginner';
        if (rate > 80 && bestStreak > 14) level = 'Master';
        else if (rate > 60 && bestStreak > 7) level = 'Veteran';
        else if (rate > 40) level = 'Intermediate';

        return {
            totalCompleted: totalComp,
            missedHabits: missed,
            completionRate: rate,
            consistencyLevel: level,
            longestStreak: bestStreak,
            categoryData: Object.entries(catMap).map(([k, v]) => ({ name: k, value: v })),
            trendData: trends,
        };
    }, [habits]);

    // CSS variable–driven chart colors (switch with theme)
    const c1 = cssVar('--chart-1', '#8B5CF6');
    const c2 = cssVar('--chart-2', '#3B82F6');
    const c3 = cssVar('--chart-3', '#06B6D4');
    const PIE_COLORS = [c1, c2, c3, '#F59E0B', '#EF4444'];

    const tooltipBg = cssVar('--chart-tooltip-bg', '#1E293B');
    const tooltipBorder = cssVar('--chart-tooltip-border', '#334155');
    const tooltipText = cssVar('--chart-tooltip-text', '#f8fafc');
    const axisTick = cssVar('--chart-axis-stroke', '#475569');
    const cursorFill = cssVar('--chart-cursor', 'rgba(30,41,59,0.5)');

    const tooltipStyle = {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderRadius: '10px',
        color: tooltipText,
        fontSize: '13px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    };

    return (
        <div className="space-y-16 animate-box-in">
            {/* ── Header ── */}
            <header className="flex justify-between items-end mb-16 px-2">
                <div>
                    <span className="section-label">Diagnostic Analysis</span>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white leading-none">
                        Reports
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold tracking-tight italic opacity-80">Data-driven insights for peak performance optimization.</p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="px-6 py-3 border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <span className="section-label mb-0">Analysis Cycle</span>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Current Q1-26</div>
                    </div>
                </div>
            </header>

            {/* ── Weekly summary ── */}
            <div className="space-y-8">
                <span className="section-label ml-2">Weekly Performance Matrix</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Total completed */}
                    <div className="momentum-card flex flex-col justify-between group">
                        <div className="flex items-center justify-between mb-10">
                            <span className="section-label mb-0">Total Success</span>
                            <div className="stat-card-icon bg-success/5 border-success/10 text-success">
                                <CheckCircle2 size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-7xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{totalCompleted}</p>
                            <span className="text-xl font-black italic opacity-20 uppercase tracking-widest">Units</span>
                        </div>
                    </div>

                    {/* Missed */}
                    <div className={cn(
                        "momentum-card flex flex-col justify-between group",
                        missedHabits > 5 ? "border-danger/20 bg-danger/[0.01]" : ""
                    )}>
                        <div className="flex items-center justify-between mb-10">
                            <span className="section-label mb-0">Velocity Drift</span>
                            <div className={cn("stat-card-icon", missedHabits > 5 ? "bg-danger/5 border-danger/10 text-danger" : "bg-warning/5 border-warning/10 text-warning")}>
                                <XOctagon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-7xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{missedHabits}</p>
                            <span className="text-xl font-black italic opacity-20 uppercase tracking-widest">Missed</span>
                        </div>
                        {missedHabits > 10 && (
                            <div className="absolute top-0 right-0 p-4">
                                <div className="text-[10px] text-danger font-black uppercase tracking-[0.2em] animate-pulse">Critical Optimization Required</div>
                            </div>
                        )}
                    </div>

                    {/* Completion rate */}
                    <div className="momentum-card flex flex-col justify-between group bg-accent/[0.02] border-accent/20">
                        <div className="flex items-center justify-between mb-10">
                            <span className="section-label mb-0 text-accent">Efficiency Yield</span>
                            <div className="stat-card-icon bg-accent/5 border-accent/10 text-accent">
                                <Zap size={24} strokeWidth={2.5} className="fill-current" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-7xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{completionRate}</p>
                            <span className="text-4xl font-black text-accent italic">%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Intelligence ── */}
            <div className="space-y-8">
                 <span className="section-label ml-2">Executive Intelligence</span>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Consistency module */}
                    <div className="momentum-card flex flex-col items-center text-center justify-center p-16 group">
                        <div className="stat-card-icon w-28 h-28 rounded-3xl mb-12 text-accent bg-accent/5 border-accent/10 shadow-none scale-110">
                            <Award size={48} strokeWidth={3} />
                        </div>
                        <span className="section-label">Operator Standing</span>
                        <p className="text-5xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter uppercase italic">{consistencyLevel}</p>
                        
                        <div className="w-24 h-1 bg-slate-100 dark:bg-white/10 mb-10 rounded-full" />
                        
                        <div className="grid grid-cols-1 w-full gap-4">
                             <div>
                                <span className="section-label">Peak Velocity Streak</span>
                                <p className="text-4xl font-black text-accent italic tracking-tighter leading-none">{longestStreak} DAYS</p>
                            </div>
                        </div>
                    </div>

                    {/* Focus Distribution */}
                    <div className="momentum-card flex flex-col group p-12">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <span className="section-label">Sector Allocation</span>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">Focus Dynamics</h3>
                            </div>
                            <div className="stat-card-icon bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5">
                                <Activity size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData.length ? categoryData : [{ name: 'IDLE', value: 1 }]}
                                        cx="50%" cy="50%"
                                        innerRadius={85} outerRadius={115}
                                        paddingAngle={10} dataKey="value" stroke="none"
                                    >
                                        {(categoryData.length ? categoryData : [{ name: 'IDLE', value: 1 }]).map((_, i) => (
                                            <Cell key={i}
                                                fill={categoryData.length ? PIE_COLORS[i % PIE_COLORS.length] : '#334155'}
                                                className="group-hover:opacity-60 transition-opacity duration-500"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: tooltipBg,
                                            borderColor: tooltipBorder,
                                            borderRadius: '16px',
                                            color: tooltipText,
                                            fontSize: '11px',
                                            fontWeight: '900',
                                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            backdropFilter: 'blur(20px)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="section-label mb-0 opacity-40">Load</span>
                                <p className="text-4xl font-black text-slate-900 dark:text-white italic leading-tight">{totalCompleted}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 mt-12">
                            {categoryData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Trajectory trend ── */}
            <div className="space-y-8">
                <span className="section-label ml-2">Trajectory Analytics</span>
                <div className="momentum-card p-12 h-[450px] group">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                             <h3 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">Success Flux</h3>
                             <p className="text-xs font-bold text-slate-400 dark:text-slate-600 italic mt-2">14-Cycle Retrospective Analysis</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Yield Baseline</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <XAxis dataKey="name" stroke={axisTick} fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} dy={20} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ stroke: cursorFill, strokeWidth: 2, strokeDasharray: '8 8' }}
                                    contentStyle={{
                                        backgroundColor: tooltipBg,
                                        borderColor: tooltipBorder,
                                        borderRadius: '16px',
                                        color: tooltipText,
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(20px)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.2em'
                                    }}
                                />
                                <Line
                                    type="monotone" dataKey="count" stroke={c1} strokeWidth={6}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 8, fill: c1, strokeWidth: 4, stroke: '#FFFFFF' }}
                                    animationDuration={2000}
                                    animationEasing="ease-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
