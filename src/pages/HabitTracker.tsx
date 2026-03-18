import { useDataContext } from '../contexts/DataContext';
import { useState, useMemo } from 'react';
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Check, Plus, Trash2, Flame, Trophy, Pencil, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditHabitModal } from '../components/EditHabitModal';
import type { Habit } from '../types';

const CATEGORIES = ['Productivity', 'Health', 'Study', 'Personal'];

export function HabitTracker() {
    const { habits, addHabit, editHabit, deleteHabit, toggleHabitDate } = useDataContext();

    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCat, setNewCat] = useState('Productivity');
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

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
            {/* ── Header ── */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-slate-900 dark:text-slate-100">Habits</h1>
                    <p className="text-slate-500 dark:text-slate-400">Forge your daily rituals.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                    <Plus size={20} /> New Habit
                </button>
            </header>

            {/* ── Add form ── */}
            {showAdd && (
                <form onSubmit={handleAdd} className="momentum-card flex flex-col sm:flex-row items-end gap-4 mb-8 border-accent/30 animate-in slide-in-from-top-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Habit Name</label>
                        <input
                            autoFocus
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                                       rounded-lg px-4 py-2.5 text-slate-900 dark:text-white
                                       focus:outline-none focus:border-accent transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="e.g. 30 Min Reading"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Category</label>
                        <select
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                                       rounded-lg px-4 py-3 text-slate-900 dark:text-white
                                       focus:outline-none focus:border-accent transition-colors"
                        >
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors h-[46px]">
                        Save
                    </button>
                </form>
            )}

            {/* ── Empty state ── */}
            {habits.length === 0 ? (
                <div className="momentum-card flex flex-col items-center justify-center text-center py-20 border-dashed">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
                        <CheckSquare className="text-accent" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No habits yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm leading-relaxed mb-6">
                        Start building powerful daily rituals. Even one small habit compounded over time changes everything.
                    </p>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                    >
                        <Plus size={18} /> Create Your First Habit
                    </button>
                </div>
            ) : (
                /* ── Habit grid ── */
                <div className="momentum-card overflow-hidden p-0">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_repeat(7,minmax(48px,1fr))_90px] gap-px
                                    border-b border-slate-100 dark:border-slate-700/50
                                    pb-4 pt-4 px-6 items-end">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">Habit</div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className="flex flex-col items-center justify-end">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    {format(day, 'EEE')}
                                </span>
                                <span className={cn(
                                    'text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full',
                                    isToday(day) ? 'bg-accent/20 text-accent' : 'text-slate-500 dark:text-slate-400'
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                        ))}
                        <div className="text-center font-medium text-slate-400 dark:text-slate-400 text-xs uppercase tracking-wider">Streak</div>
                    </div>

                    {/* Habit rows */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50 p-6 pt-0">
                        {habits.map(habit => (
                            <div key={habit.id}
                                className="grid grid-cols-[1fr_repeat(7,minmax(48px,1fr))_90px] gap-px items-center py-4
                                           group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors -mx-6 px-6">
                                {/* Name + category */}
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{habit.title}</p>
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

                                {/* Day toggles */}
                                {weekDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const isCompleted = habit.completedDates.includes(dateStr);
                                    const isFuture = day > new Date() && !isToday(day);
                                    return (
                                        <div key={dateStr} className="flex justify-center">
                                            <button
                                                disabled={isFuture}
                                                onClick={() => toggleHabitDate(habit.id, dateStr)}
                                                title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                                                className={cn(
                                                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border',
                                                    'disabled:opacity-25 disabled:cursor-not-allowed',
                                                    isCompleted
                                                        ? 'bg-success/20 border-success/40 text-success shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                                                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700/50 text-transparent hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800/70'
                                                )}
                                            >
                                                <Check size={18}
                                                    className={isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'}
                                                    strokeWidth={3}
                                                />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Streak + edit/delete */}
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-center gap-1">
                                        <Flame size={16} className={habit.currentStreak > 0 ? 'text-warning fill-warning/20' : 'text-slate-300 dark:text-slate-600'} />
                                        <span className={cn('font-bold font-sans text-sm', habit.currentStreak > 0 ? 'text-warning' : 'text-slate-400 dark:text-slate-500')}>
                                            {habit.currentStreak}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingHabit(habit)} title="Edit habit"
                                            className="text-slate-400 hover:text-accent transition-colors">
                                            <Pencil size={13} />
                                        </button>
                                        <button onClick={() => setDeletingHabit(habit)} title="Delete habit"
                                            className="text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            <EditHabitModal
                habit={editingHabit}
                onSave={(id, title, category) => { editHabit(id, title, category); setEditingHabit(null); }}
                onCancel={() => setEditingHabit(null)}
            />
            <ConfirmModal
                isOpen={!!deletingHabit}
                title="Delete Habit?"
                message={`"${deletingHabit?.title}" and all its completion history will be permanently deleted. This cannot be undone.`}
                confirmLabel="Delete Habit"
                onConfirm={() => { if (deletingHabit) { deleteHabit(deletingHabit.id); setDeletingHabit(null); } }}
                onCancel={() => setDeletingHabit(null)}
            />
        </div>
    );
}
