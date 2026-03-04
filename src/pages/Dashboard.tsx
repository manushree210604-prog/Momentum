import { useDataContext } from '../contexts/DataContext';
import { useMemo } from 'react';
import { format, subDays, isSameWeek, isSameMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sparkles, Activity, CheckCircle, CalendarDays, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
    const { habits, goals, stats } = useDataContext();

    const totalHabits = habits.length;

    const { activeStreak, weeklyCompletion, monthlyCompletion, weeklyData } = useMemo(() => {
        let streak = 0;
        habits.forEach(h => { if (h.currentStreak > streak) streak = h.currentStreak; });

        const now = new Date();
        let thisWeekTotal = 0;
        let thisWeekCompleted = 0;
        let thisMonthTotal = 0;
        let thisMonthCompleted = 0;

        const weeklyStats = [6, 5, 4, 3, 2, 1, 0].map(diff => {
            return {
                name: format(subDays(now, diff), 'EEE'),
                dateStr: format(subDays(now, diff), 'yyyy-MM-dd'),
                completed: 0
            };
        });

        habits.forEach(h => {
            // Very basic approximation: habit should be completed every day.
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
            weeklyData: weeklyStats
        };
    }, [habits]);

    return (
        <div className="space-y-section animate-in fade-in duration-500">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Momentum</h1>
                    <p className="text-slate-400">Welcome back. Let's build your future.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Activity className="text-accent" />} label="Total Habits" value={totalHabits} />
                <StatCard icon={<Flame className="text-warning" />} label="Active Streak" value={`${activeStreak} Days`} />
                <StatCard icon={<CheckCircle className="text-success" />} label="Weekly Goal" value={`${weeklyCompletion}%`} />
                <StatCard icon={<CalendarDays className="text-blue-400" />} label="Monthly Avg" value={`${monthlyCompletion}%`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 momentum-card h-96 flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        Weekly Performance
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                />
                                <Bar dataKey="completed" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="momentum-card flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-slate-800 to-slate-900 border-accent/20">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                        <Sparkles className="text-accent w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">"Small disciplines repeated with consistency every day lead to great achievements gained slowly over time."</h3>
                    <p className="text-slate-400 font-medium">— John C. Maxwell</p>
                </div>
            </div>

            {/* Intelligent Insights */}
            {weeklyCompletion < 50 && totalHabits > 0 && (
                <div className="momentum-card bg-warning/10 border-warning/20 flex items-start gap-4">
                    <div className="p-2 bg-warning/20 rounded-lg text-warning mt-1"><Activity size={20} /></div>
                    <div>
                        <h4 className="text-warning font-bold mb-1">Improvement Suggestion</h4>
                        <p className="text-slate-300 text-sm">Your weekly completion is below 50%. Focus on your easiest habit today to build momentum.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
        <div className="momentum-card flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700/50">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className="text-2xl font-bold font-sans tracking-tight">{value}</p>
            </div>
        </div>
    )
}
