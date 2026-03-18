import { useDataContext } from '../contexts/DataContext';
import { useState, useCallback } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Target, Plus, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditGoalModal } from '../components/EditGoalModal';
import { Confetti } from '../components/Confetti';
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
    const [confettiActive, setConfettiActive] = useState(false);

    const handleProgressUpdate = useCallback((id: string, progress: number) => {
        const existing = goals.find(g => g.id === id);
        if (progress === 100 && existing?.status !== 'Completed') {
            setConfettiActive(true);
        }
        updateGoalProgress(id, progress);
    }, [goals, updateGoalProgress]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim() && newDeadline) {
            addGoal(newTitle.trim(), newCat, new Date(newDeadline).getTime());
            setNewTitle('');
            setShowAdd(false);
        }
    };

    return (
        <>
        <Confetti active={confettiActive} onDone={() => setConfettiActive(false)} />
        <div className="space-y-12 animate-box-in">
            {/* ── Header ── */}
            <header className="flex justify-between items-end mb-16 px-2">
                <div>
                    <span className="section-label">Strategy & Objectives</span>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white leading-none">
                        Goals
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold tracking-tight italic opacity-80">Aim with precision. Execute with discipline.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-accent hover:opacity-90 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl shadow-accent/30 active:scale-95 italic"
                >
                    <Plus size={22} strokeWidth={3} /> Define Objective
                </button>
            </header>

            {/* ── Add form ── */}
            {showAdd && (
                <form onSubmit={handleAdd} className="momentum-card flex flex-col lg:flex-row items-end gap-8 mb-16 border-accent/20 bg-accent/[0.02] dark:bg-accent/[0.03] animate-in slide-in-from-top-6 duration-700">
                    <div className="flex-[2] w-full group">
                        <span className="section-label">Objective Title</span>
                        <input
                            autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                            className="box-input"
                            placeholder="e.g. Master Structural Design"
                        />
                    </div>
                    <div className="w-full lg:w-56">
                        <span className="section-label">Deadline Cycle</span>
                        <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                            className="box-input"
                        />
                    </div>
                    <div className="w-full lg:w-56">
                        <span className="section-label">Classification</span>
                        <select value={newCat} onChange={e => setNewCat(e.target.value)}
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
            {goals.length === 0 ? (
                <div className="momentum-card flex flex-col items-center justify-center text-center py-32 border-dashed border-2 bg-transparent shadow-none border-slate-200 dark:border-white/10">
                    <div className="stat-card-icon mb-10 text-accent scale-125 rotate-6 bg-accent/5 border-accent/10 shadow-none">
                        <Target size={44} strokeWidth={2.5} />
                    </div>
                    <span className="section-label">Blueprint Empty</span>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter italic uppercase">Define Your Vision</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm font-bold leading-relaxed mb-12 text-xl italic opacity-80">
                        Goals without deadlines are just wishes. Define what you want to achieve.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {['Master Rust', 'Zero Inbox', 'Launch Beta', '10K Steps'].map(idea => (
                            <button key={idea}
                                onClick={() => { setNewTitle(idea); setShowAdd(true); }}
                                className="text-[10px] uppercase px-5 py-2.5 font-black tracking-[0.2em] rounded-xl
                                           bg-slate-50 dark:bg-white/5
                                           border-2 border-slate-100 dark:border-white/5
                                           text-slate-400 dark:text-slate-500 italic
                                           hover:text-accent hover:border-accent/30 transition-all hover:-translate-y-1"
                            >
                                {idea}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="bg-accent hover:opacity-90 text-white px-10 py-5 rounded-xl font-black text-sm uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl shadow-accent/40 hover:-translate-y-1 active:scale-95 italic"
                    >
                        <Plus size={24} strokeWidth={3} /> Set First Objective
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-10">
                    {goals.map(goal => {
                        const isCompleted = goal.status === 'Completed';
                        const deadlineDate = new Date(goal.deadline);
                        const isPastDue = deadlineDate < new Date() && !isCompleted;

                        return (
                            <div key={goal.id} className={cn(
                                'momentum-card p-10 flex flex-col gap-10 group/card border-slate-100 dark:border-white/[0.03]',
                                isCompleted && 'border-success/30 bg-success/[0.01]',
                                isPastDue && 'border-danger/30 bg-danger/[0.02]'
                            )}>
                                <div className="flex justify-between items-start gap-8">
                                    <div className="flex items-start gap-8 min-w-0">
                                        {/* Status Unit */}
                                        <div className={cn(
                                            'w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center border-2 transition-all duration-700',
                                            isCompleted
                                                ? 'bg-success/10 border-success/30 text-success shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                                                : isPastDue
                                                    ? 'bg-danger/10 border-danger/30 text-danger'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 text-slate-300 group-hover/card:border-accent/30 group-hover/card:text-accent group-hover/card:scale-105'
                                        )}>
                                            {isCompleted ? <CheckCircle2 size={36} strokeWidth={3} /> : <Target size={36} strokeWidth={3} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="section-label">Objective Module</span>
                                            <h3 className={cn(
                                                'text-3xl font-black tracking-tighter truncate leading-none italic uppercase mb-4',
                                                isCompleted ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-white'
                                            )}>
                                                {goal.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="text-accent bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10 text-[9px] tracking-[0.3em] font-black uppercase italic">
                                                    {goal.category}
                                                </span>
                                                <span className={cn('flex items-center gap-2 text-[10px] font-black tracking-[0.1em] uppercase italic', isPastDue && !isCompleted ? 'text-danger' : 'text-slate-400 dark:text-slate-600')}>
                                                    Due {format(deadlineDate, 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Velocity readout */}
                                    <div className="flex flex-col items-end gap-6 flex-shrink-0">
                                        <div className="text-right flex flex-col items-end">
                                            <span className="section-label mb-1">Yield</span>
                                            <div className="flex items-baseline gap-1">
                                                <p className={cn(
                                                    "text-5xl font-black tracking-tighter leading-none italic",
                                                    isCompleted ? "text-success" : "text-slate-900 dark:text-white"
                                                )}>{goal.progress}</p>
                                                <span className="text-xl font-black italic opacity-30">%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-x-4 group-hover/card:translate-x-0">
                                             <button onClick={() => setEditingGoal(goal)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10 text-slate-400 hover:text-accent hover:border-accent/40 hover:scale-110 transition-all shadow-lg">
                                                <Pencil size={16} strokeWidth={3} />
                                            </button>
                                            <button onClick={() => setDeletingGoal(goal)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10 text-slate-400 hover:text-danger hover:border-danger/40 hover:scale-110 transition-all shadow-lg">
                                                <Trash2 size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Engine */}
                                <div className="mt-4 space-y-6">
                                     <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="section-label mb-1">Time Component</span>
                                            <span className={cn(
                                                "text-xs font-black uppercase italic tracking-widest",
                                                isPastDue && !isCompleted ? "text-danger" : "text-slate-500 dark:text-slate-400"
                                            )}>{formatDistanceToNow(deadlineDate, { addSuffix: true })}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="section-label mb-1">Status</span>
                                            <span className={cn(
                                                "text-xs font-black italic tracking-widest leading-none",
                                                isCompleted ? "text-success" : "text-accent"
                                            )}>{goal.status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Structural Progress Bar */}
                                    <div className="relative">
                                        <div className="h-6 w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-white/5 rounded-lg overflow-hidden p-0.5">
                                            <div
                                                className={cn(
                                                    'h-full transition-all duration-1000 ease-out flex',
                                                    isCompleted ? 'bg-success' : 'bg-accent'
                                                )}
                                                style={{ width: `${goal.progress}%` }}
                                            >
                                                <div className="w-full h-full opacity-10 bg-[length:15px_15px]" 
                                                     style={{ backgroundImage: 'linear-gradient(90deg, #fff 1px, transparent 1px)' }}></div>
                                            </div>
                                        </div>
                                        {/* Dynamic Scale */}
                                        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1 pointer-events-none opacity-20">
                                            {[...Array(11)].map((_, i) => (
                                                <div key={i} className="h-full w-px bg-slate-400 dark:bg-white" />
                                            ))}
                                        </div>
                                    </div>

                                    {!isCompleted && (
                                        <div className="relative group/slider pt-4 px-2">
                                            <input type="range" min="0" max="100" value={goal.progress}
                                                onChange={e => handleProgressUpdate(goal.id, parseInt(e.target.value, 10))}
                                                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent 
                                                       hover:scale-y-125 transition-all duration-300"
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* Inset Footer */}
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover/card:opacity-20 transition-opacity">
                                     <Target size={120} strokeWidth={0.5} />
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
        </>
    );
}
