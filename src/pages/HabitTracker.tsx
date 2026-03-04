import { useDataContext } from '../contexts/DataContext';
import { useState, useMemo } from 'react';
import { format, subDays, isToday, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Check, Plus, Trash2, Flame, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

export function HabitTracker() {
    const { habits, addHabit, deleteHabit, toggleHabitDate } = useDataContext();
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCat, setNewCat] = useState('Productivity');

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const weekDays = useMemo(() => {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            addHabit(newTitle.trim(), newCat);
            setNewTitle('');
            setShowAdd(false);
        }
    };

    return (
        <div className="space-y-section animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Habits</h1>
                    <p className="text-slate-400">Forge your daily rituals.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                    <Plus size={20} />
                    New Habit
                </button>
            </header>

            {showAdd && (
                <form onSubmit={handleAdd} className="momentum-card flex items-end gap-4 mb-8 bg-slate-800/80 border-accent/30 animate-in slide-in-from-top-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Habit Name</label>
                        <input
                            autoFocus
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder="e.g. 30 Min Reading"
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                        <select
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                        >
                            <option>Productivity</option>
                            <option>Health</option>
                            <option>Study</option>
                            <option>Personal</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors h-[46px]">
                        Save
                    </button>
                </form>
            )}

            <div className="momentum-card overflow-hidden p-0">
                <div className="grid grid-cols-[1fr_repeat(7,minmax(60px,1fr))_80px] gap-px bg-slate-800/50 border-b border-slate-700/50 pb-4 pt-4 px-6 items-end">
                    <div className="font-semibold text-slate-300">Resolute Action</div>
                    {weekDays.map(day => (
                        <div key={day.toString()} className="flex flex-col items-center justify-end">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                {format(day, 'EEE')}
                            </span>
                            <span className={cn(
                                "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                isToday(day) ? "bg-accent/20 text-accent" : "text-slate-400"
                            )}>
                                {format(day, 'd')}
                            </span>
                        </div>
                    ))}
                    <div className="text-center font-medium text-slate-400 text-xs uppercase tracking-wider">Streak</div>
                </div>

                <div className="divide-y divide-slate-800/50 p-6 pt-0">
                    {habits.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">No habits created yet. Click "New Habit" to start.</div>
                    ) : (
                        habits.map(habit => (
                            <div key={habit.id} className="grid grid-cols-[1fr_repeat(7,minmax(60px,1fr))_80px] gap-px items-center py-4 group hover:bg-slate-800/30 transition-colors -mx-6 px-6">
                                <div>
                                    <p className="font-semibold text-slate-100">{habit.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
                                            {habit.category}
                                        </span>
                                        {habit.currentStreak >= 7 && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-warning flex items-center gap-1">
                                                <Trophy size={10} /> 7+ Streak
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {weekDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const isCompleted = habit.completedDates.includes(dateStr);
                                    const isFuture = day > new Date() && !isToday(day);

                                    return (
                                        <div key={dateStr} className="flex justify-center">
                                            <button
                                                disabled={isFuture}
                                                onClick={() => toggleHabitDate(habit.id, dateStr)}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-105 hover:bg-slate-700 border",
                                                    isCompleted ? "bg-success/20 border-success/30 text-success shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "bg-slate-900 border-slate-700/50 text-transparent"
                                                )}
                                            >
                                                <Check size={20} className={isCompleted ? "opacity-100" : "opacity-0"} strokeWidth={3} />
                                            </button>
                                        </div>
                                    );
                                })}

                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-1">
                                        <Flame size={18} className={habit.currentStreak > 0 ? "text-warning fill-warning/20" : "text-slate-600"} />
                                        <span className={cn("font-bold font-sans", habit.currentStreak > 0 ? "text-warning" : "text-slate-500")}>
                                            {habit.currentStreak}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteHabit(habit.id)}
                                        className="text-slate-600 hover:text-red-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
