import { useDataContext } from '../contexts/DataContext';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Award, Zap, CheckCircle2, XOctagon } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const COLORS = ['#8B5CF6', '#22C55E', '#FACC15', '#3B82F6', '#EF4444'];

export function Reports() {
    const { habits } = useDataContext();

    const { totalCompleted, missedHabits, completionRate, consistencyLevel, longestStreak, categoryData, trendData } = useMemo(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });

        let totalComp = 0;
        let missed = 0;
        let bestStreak = 0;
        const catMap: Record<string, number> = {};

        // Trend for last 14 days
        const trends = Array.from({ length: 14 }).map((_, i) => {
            return {
                name: format(subDays(now, 13 - i), 'MMM dd'),
                dateStr: format(subDays(now, 13 - i), 'yyyy-MM-dd'),
                count: 0
            };
        });

        habits.forEach(h => {
            if (h.longestStreak > bestStreak) bestStreak = h.longestStreak;

            // Weekly analysis
            let weeklyExpect = 7;
            let weeklyActual = 0;
            h.completedDates.forEach(dStr => {
                const d = new Date(dStr);
                if (isWithinInterval(d, { start, end })) {
                    weeklyActual++;
                    totalComp++;
                }

                // Cat pie
                catMap[h.category] = (catMap[h.category] || 0) + 1;

                // Line trend
                const tIdx = trends.findIndex(t => t.dateStr === dStr);
                if (tIdx !== -1) trends[tIdx].count++;
            });

            missed += (weeklyExpect - weeklyActual);
        });

        const expectedWeeklyTotal = habits.length * 7;
        const rate = expectedWeeklyTotal ? Math.round((totalComp / expectedWeeklyTotal) * 100) : 0;

        // Consistency
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
            trendData: trends
        };
    }, [habits]);

    return (
        <div className="space-y-section animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Reports</h1>
                <p className="text-slate-400">Data never lies. Track your trajectory over time.</p>
            </header>

            <h2 className="text-xl font-bold tracking-tight mb-4">Weekly Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="momentum-card flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold tracking-wider text-slate-400">TOTAL COMPLETED</span>
                        <CheckCircle2 className="text-success" />
                    </div>
                    <p className="text-5xl font-bold font-sans text-slate-100">{totalCompleted}</p>
                </div>

                <div className="momentum-card flex flex-col justify-between p-6 border-warning/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold tracking-wider text-slate-400">MISSED OPPORTUNITIES</span>
                        <XOctagon className="text-warning" />
                    </div>
                    <p className="text-5xl font-bold font-sans text-slate-100">{missedHabits}</p>
                    {missedHabits > 5 && (
                        <p className="text-xs text-warning mt-2 mt-auto">Action required: Focus on consistency.</p>
                    )}
                </div>

                <div className="momentum-card flex flex-col justify-between p-6 bg-gradient-to-br from-slate-800 to-accent/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold tracking-wider text-slate-400">COMPLETION RATE</span>
                        <Zap className="text-accent" />
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-5xl font-bold font-sans text-white">{completionRate}%</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight mt-12 mb-4">Monthly & All-Time Intelligence</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                <div className="momentum-card p-6 flex flex-col items-center text-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                        <Award className="text-accent w-10 h-10" />
                    </div>
                    <p className="text-sm uppercase font-bold tracking-widest text-slate-400 mb-2">Consistency Score</p>
                    <p className="text-3xl font-bold text-white mb-6">{consistencyLevel}</p>

                    <div className="w-full h-px bg-slate-800 my-4" />

                    <p className="text-sm uppercase font-bold tracking-widest text-slate-400 mb-2">Longest Streak</p>
                    <p className="text-2xl font-bold text-white">{longestStreak} Days</p>
                </div>

                <div className="momentum-card p-6 min-h-[300px] flex flex-col">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                        Category Breakdown
                    </h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {categoryData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="momentum-card p-6 h-80 flex flex-col">
                <h3 className="text-sm font-semibold tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                    14-Day Completion Trend
                </h3>
                <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
                                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#0F172A', stroke: '#8B5CF6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#8B5CF6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
