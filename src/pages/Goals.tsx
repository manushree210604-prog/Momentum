import { useDataContext } from '../contexts/DataContext';
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Target, Plus, CheckCircle2, ChevronRight, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Goals() {
    const { goals, addGoal, updateGoalProgress, deleteGoal } = useDataContext();
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCat, setNewCat] = useState('Study');
    const [newDeadline, setNewDeadline] = useState(format(new Date(), 'yyyy-MM-dd'));

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
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Goals</h1>
                    <p className="text-slate-400">Aim high. Break it down. Execute.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                    <Plus size={20} />
                    New Goal
                </button>
            </header>

            {showAdd && (
                <form onSubmit={handleAdd} className="momentum-card flex items-end gap-4 mb-8 bg-slate-800/80 border-accent/30 animate-in slide-in-from-top-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Goal Title</label>
                        <input
                            autoFocus
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder="e.g. Master React Native"
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Deadline</label>
                        <input
                            type="date"
                            value={newDeadline}
                            onChange={e => setNewDeadline(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors block"
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                        <select
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                        >
                            <option>Study</option>
                            <option>Productivity</option>
                            <option>Health</option>
                            <option>Personal</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors h-[46px]">
                        Save
                    </button>
                </form>
            )}

            <div className="grid gap-4">
                {goals.map(goal => {
                    const isCompleted = goal.status === 'Completed';
                    const deadlineDate = new Date(goal.deadline);

                    return (
                        <div key={goal.id} className={cn(
                            "momentum-card p-6 flex flex-col gap-4 border group transition-all duration-300",
                            isCompleted ? "bg-slate-800/50 border-success/30" : "bg-card border-slate-700/50 hover:border-slate-600"
                        )}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                        isCompleted ? "bg-success/20 border-success/40 text-success" : "bg-slate-900 border-slate-700 text-slate-400"
                                    )}>
                                        {isCompleted ? <CheckCircle2 size={24} /> : <Target size={24} />}
                                    </div>
                                    <div>
                                        <h3 className={cn("text-xl font-bold tracking-tight", isCompleted ? "text-slate-300 line-through" : "text-slate-100")}>
                                            {goal.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm font-medium">
                                            <span className="text-accent bg-accent/10 px-2 py-0.5 rounded-sm uppercase text-[10px] tracking-wider">
                                                {goal.category}
                                            </span>
                                            <span className="text-slate-500 flex items-center gap-1">
                                                Due {format(deadlineDate, 'MMM d, yyyy')} ({formatDistanceToNow(deadlineDate, { addSuffix: true })})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-3xl font-bold font-sans tracking-tight mb-1">{goal.progress}%</p>
                                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">{goal.status}</p>
                                    </div>
                                    <button onClick={() => deleteGoal(goal.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex justify-between text-xs font-semibold text-slate-400 tracking-wider">
                                    <span>PROGRESS</span>
                                    <span>100%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={goal.progress}
                                        onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value, 10))}
                                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-accent"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
