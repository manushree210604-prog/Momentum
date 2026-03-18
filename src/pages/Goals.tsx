import { useDataContext } from '../contexts/DataContext';
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Target, Plus, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditGoalModal } from '../components/EditGoalModal';
import type { Goal } from '../types';

const CATEGORIES = ['Study', 'Productivity', 'Health', 'Personal'];

export function Goals() {
    const { goals, addGoal, editGoal, updateGoalProgress, deleteGoal } = useDataContext();

    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCat, setNewCat] = useState('Study');
    const [newDeadline, setNewDeadline] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim() && newDeadline) {
            addGoal(newTitle.trim(), newCat, new Date(newDeadline).getTime());
            setNewTitle('');
            setShowAdd(false);
        }
    };

    return (
        <div className="space-y-section animate-in fade-in duration-500">
            {/* ── Header ── */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-slate-900 dark:text-slate-100">Goals</h1>
                    <p className="text-slate-500 dark:text-slate-400">Aim high. Break it down. Execute.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                    <Plus size={20} /> New Goal
                </button>
            </header>

            {/* ── Add form ── */}
            {showAdd && (
                <form onSubmit={handleAdd} className="momentum-card flex flex-col sm:flex-row items-end gap-4 mb-8 border-accent/30 animate-in slide-in-from-top-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Goal Title</label>
                        <input
                            autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                                       rounded-lg px-4 py-2.5 text-slate-900 dark:text-white
                                       focus:outline-none focus:border-accent transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="e.g. Master React Native"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Deadline</label>
                        <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                                       rounded-lg px-4 py-2 text-slate-900 dark:text-white
                                       focus:outline-none focus:border-accent transition-colors block"
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Category</label>
                        <select value={newCat} onChange={e => setNewCat(e.target.value)}
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
            {goals.length === 0 ? (
                <div className="momentum-card flex flex-col items-center justify-center text-center py-24 border-dashed">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <Target className="text-accent" size={36} />
                        </div>
                        <div className="absolute -inset-2 rounded-3xl border border-accent/10 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">No goals set yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed mb-8">
                        Goals without deadlines are just wishes. Define what you want to achieve, set a deadline, and track your progress every step of the way.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {['Read 12 books this year', 'Run a 5K', 'Ship a side project', 'Learn Spanish'].map(idea => (
                            <button key={idea}
                                onClick={() => { setNewTitle(idea); setShowAdd(true); }}
                                className="text-xs px-3 py-1.5 rounded-full
                                           bg-slate-100 dark:bg-slate-700/60
                                           border border-slate-200 dark:border-slate-600/50
                                           text-slate-500 dark:text-slate-400
                                           hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-colors"
                            >
                                {idea}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="bg-accent hover:bg-accent/90 text-white px-7 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                    >
                        <Plus size={18} /> Set Your First Goal
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {goals.map(goal => {
                        const isCompleted = goal.status === 'Completed';
                        const deadlineDate = new Date(goal.deadline);
                        const isPastDue = deadlineDate < new Date() && !isCompleted;

                        return (
                            <div key={goal.id} className={cn(
                                'momentum-card p-6 flex flex-col gap-4 group transition-all duration-300',
                                isCompleted
                                    ? 'border-success/30'
                                    : isPastDue
                                        ? 'border-red-400/20 dark:border-red-500/20 hover:border-red-400/30'
                                        : 'hover:border-slate-300 dark:hover:border-slate-600'
                            )}>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Status icon */}
                                        <div className={cn(
                                            'w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border',
                                            isCompleted
                                                ? 'bg-success/20 border-success/40 text-success'
                                                : isPastDue
                                                    ? 'bg-red-500/10 border-red-400/30 text-red-500 dark:text-red-400'
                                                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                                        )}>
                                            {isCompleted ? <CheckCircle2 size={24} /> : <Target size={24} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className={cn(
                                                'text-xl font-bold tracking-tight truncate',
                                                isCompleted ? 'text-slate-400 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'
                                            )}>
                                                {goal.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-accent bg-accent/10 px-2 py-0.5 rounded-sm uppercase text-[10px] tracking-wider font-bold">
                                                    {goal.category}
                                                </span>
                                                <span className={cn('flex items-center gap-1 text-xs font-medium', isPastDue && !isCompleted ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500')}>
                                                    Due {format(deadlineDate, 'MMM d, yyyy')} ({formatDistanceToNow(deadlineDate, { addSuffix: true })})
                                                </span>
                                                {isPastDue && !isCompleted && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-sm">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress % + actions */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-3xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-100">{goal.progress}%</p>
                                            <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">{goal.status}</p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingGoal(goal)} title="Edit goal"
                                                className="text-slate-400 hover:text-accent transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => setDeletingGoal(goal)} title="Delete goal"
                                                className="text-slate-400 hover:text-red-400 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar + slider */}
                                <div className="mt-2 flex flex-col gap-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                                        <span>PROGRESS</span>
                                        <span>{goal.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                isCompleted ? 'bg-success' : 'bg-gradient-to-r from-accent to-violet-400'
                                            )}
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                    {!isCompleted && (
                                        <input type="range" min="0" max="100" value={goal.progress}
                                            onChange={e => updateGoalProgress(goal.id, parseInt(e.target.value, 10))}
                                            className="w-full h-1 bg-transparent rounded-full appearance-none cursor-pointer accent-accent mt-0.5"
                                            title={`Progress: ${goal.progress}%`}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <EditGoalModal
                goal={editingGoal}
                onSave={(id, title, category, deadline) => { editGoal(id, title, category, deadline); setEditingGoal(null); }}
                onCancel={() => setEditingGoal(null)}
            />
            <ConfirmModal
                isOpen={!!deletingGoal}
                title="Delete Goal?"
                message={`"${deletingGoal?.title}" will be permanently deleted. All progress will be lost.`}
                confirmLabel="Delete Goal"
                onConfirm={() => { if (deletingGoal) { deleteGoal(deletingGoal.id); setDeletingGoal(null); } }}
                onCancel={() => setDeletingGoal(null)}
            />
        </div>
    );
}
