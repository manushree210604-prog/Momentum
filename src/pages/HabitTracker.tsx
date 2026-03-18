import { useDataContext } from '../contexts/DataContext';
import { useState, useMemo } from 'react';
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Check, Plus, Trash2, Flame, Trophy, Pencil, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditHabitModal } from '../components/EditHabitModal';
import { XpParticle } from '../components/XpParticle';
import type { XpToast } from '../components/XpParticle';
import type { Habit } from '../types';

const CATEGORIES = ['Productivity', 'Health', 'Study', 'Personal'];

export function HabitTracker() {
    const { habits, addHabit, editHabit, deleteHabit, toggleHabitDate } = useDataContext();

    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCat, setNewCat] = useState('Productivity');
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
    const [xpToasts, setXpToasts] = useState<XpToast[]>([]);
    let toastId = 0;

    const fireXp = (e: React.MouseEvent, amount = 20) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const id = ++toastId;
        setXpToasts(t => [...t, { id, amount, x: rect.left + rect.width / 2, y: rect.top }]);
    };

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
        <>
        {xpToasts.map(t => <XpParticle key={t.id} toast={t} onDone={id => setXpToasts(ts => ts.filter(x => x.id !== id))} />)}
        <div className="space-y-12 animate-box-in">
            {/* ── Header ── */}
            <header className="flex justify-between items-end mb-16 px-2">
                <div>
                    <span className="section-label">Routine Configuration</span>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white leading-none">
                        Habits
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold tracking-tight italic opacity-80">Forge your daily rituals with mechanical precision.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-accent hover:opacity-90 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl shadow-accent/30 active:scale-95 italic"
                >
                    <Plus size={22} strokeWidth={3} /> New Routine
                </button>
            </header>

            {/* ── Add form ── */}
            {showAdd && (
                <form onSubmit={handleAdd} className="momentum-card flex flex-col lg:flex-row items-end gap-8 mb-16 border-accent/20 bg-accent/[0.02] dark:bg-accent/[0.03] animate-in slide-in-from-top-6 duration-700">
                    <div className="flex-1 w-full group">
                        <span className="section-label">Ritual Label</span>
                        <input
                            autoFocus
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="box-input"
                            placeholder="e.g. Master React Native"
                        />
                    </div>
                    <div className="w-full lg:w-64">
                        <span className="section-label">Classification</span>
                        <select
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            className="box-input cursor-pointer"
                        >
                            {CATEGORIES.map(c => <option key={c} className="bg-white dark:bg-slate-900 font-bold">{c}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full lg:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all h-[64px] shadow-2xl italic">
                        Initialize
                    </button>
                </form>
            )}

            {/* ── Empty state ── */}
            {habits.length === 0 ? (
                <div className="momentum-card flex flex-col items-center justify-center text-center py-32 border-dashed border-2 bg-transparent shadow-none border-slate-200 dark:border-white/10">
                    <div className="stat-card-icon mb-10 text-accent scale-125 rotate-6 bg-accent/5 border-accent/10 shadow-none">
                        <CheckSquare size={36} strokeWidth={2.5} />
                    </div>
                    <span className="section-label">Deployment Ready</span>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter italic uppercase">Your Journey Awaits</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm font-bold leading-relaxed mb-12 text-xl italic opacity-80">
                        Even one small habit compounded over time changes everything.
                    </p>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="bg-accent hover:opacity-90 text-white px-10 py-5 rounded-xl font-black text-sm uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl shadow-accent/40 hover:-translate-y-1 active:scale-95 italic"
                    >
                        <Plus size={24} strokeWidth={3} /> Create First Ritual
                    </button>
                </div>
            ) : (
                /* ── Habit grid ── */
                <div className="momentum-card p-0 overflow-visible shadow-2xl border-white/40 dark:border-white/5">
                    {/* Matrix Header */}
                    <div className="grid grid-cols-[1.5fr_repeat(7,minmax(70px,1fr))_130px] gap-0
                                    border-b border-slate-100 dark:border-white/5
                                    pb-8 pt-10 px-12 items-end min-w-[900px]">
                        <div>
                            <span className="section-label mb-0">Ritual Matrix</span>
                            <div className="text-[10px] font-black italic opacity-30 mt-1 uppercase tracking-widest">Active Operations</div>
                        </div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className="flex flex-col items-center justify-end">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] mb-4 italic",
                                    isToday(day) ? "text-accent" : "text-slate-400 dark:text-slate-600"
                                )}>
                                    {format(day, 'EEE')}
                                </span>
                                <div className={cn(
                                    'w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-500 border-2 font-black italic text-sm',
                                    isToday(day) 
                                        ? 'bg-accent/10 text-accent border-accent/30 shadow-inner' 
                                        : 'text-slate-400 dark:text-slate-600 border-transparent'
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                        <div className="text-center">
                            <span className="section-label mb-0">Streak</span>
                            <div className="text-[9px] font-black italic opacity-30 mt-1 uppercase tracking-widest">Velocity</div>
                        </div>
                    </div>

                    {/* Habit rows */}
                    <div className="divide-y divide-slate-100 dark:divide-white/5 p-12 pt-0 min-w-[900px]">
                        {habits.map(habit => (
                            <div key={habit.id}
                                className="grid grid-cols-[1.5fr_repeat(7,minmax(70px,1fr))_130px] gap-0 items-center py-10
                                           group/row hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all -mx-12 px-12 relative">
                                
                                {/* Status Line */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-accent opacity-0 group-hover/row:opacity-100 transition-opacity" />

                                {/* Name + category */}
                                <div className="pr-8 group/title">
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic group-hover/row:translate-x-2 transition-transform duration-500 opacity-90 group-hover/row:opacity-100">{habit.title}</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <span className="text-[9px] uppercase font-black tracking-[0.3em] text-accent bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
                                            {habit.category}
                                        </span>
                                        {habit.currentStreak >= 7 && (
                                            <span className="text-[9px] uppercase font-black tracking-[0.25em] text-warning bg-warning/5 px-3 py-1.5 rounded-lg border border-warning/10 flex items-center gap-2">
                                                <Trophy size={11} strokeWidth={2.5} /> Velocity-High
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
                                                onClick={(e) => {
                                                    if (!isCompleted && !isFuture) fireXp(e);
                                                    toggleHabitDate(habit.id, dateStr);
                                                }}
                                                className={cn(
                                                    'w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-700 border-2 relative overflow-hidden group/btn',
                                                    'disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed',
                                                    isCompleted
                                                        ? 'bg-success border-success text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] scale-110'
                                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-white/5 text-transparent hover:border-accent/30 hover:bg-white dark:hover:bg-black hover:scale-105'
                                                )}
                                            >
                                                <Check size={26}
                                                    className={cn(
                                                        "transition-all duration-500",
                                                        isCompleted ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12 group-hover/btn:opacity-30 group-hover/btn:scale-100 group-hover/btn:text-accent'
                                                    )}
                                                    strokeWidth={4.5}
                                                />
                                                {isCompleted && (
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Streak indicator */}
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <div className="relative group/streak">
                                        <div className={cn(
                                            "flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all duration-500 shadow-sm",
                                            habit.currentStreak > 0 
                                                ? "bg-warning/5 border-warning/20 text-warning" 
                                                : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 group-hover/row:opacity-100"
                                        )}>
                                            <Flame size={20} className={habit.currentStreak > 0 ? 'fill-warning/40' : ''} strokeWidth={2.5} />
                                            <span className="font-black text-2xl tracking-tighter leading-none italic">{habit.currentStreak}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Group */}
                                    <div className="flex items-center gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-y-3 group-hover/row:translate-y-0">
                                        <button onClick={() => setEditingHabit(habit)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10 text-slate-400 hover:text-accent hover:border-accent/40 hover:scale-110 transition-all shadow-lg shadow-black/5">
                                            <Pencil size={14} strokeWidth={3} />
                                        </button>
                                        <button onClick={() => setDeletingHabit(habit)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10 text-slate-400 hover:text-danger hover:border-danger/40 hover:scale-110 transition-all shadow-lg shadow-black/5">
                                            <Trash2 size={14} strokeWidth={3} />
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
        </>
    );
}
