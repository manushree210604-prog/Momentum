import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { Goal } from '../types';
import { format } from 'date-fns';

const CATEGORIES = ['Study', 'Productivity', 'Health', 'Personal'];

interface EditGoalModalProps {
    goal: Goal | null;
    onSave: (id: string, title: string, category: string, deadline: number) => void;
    onCancel: () => void;
}

export function EditGoalModal({ goal, onSave, onCancel }: EditGoalModalProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Study');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        if (goal) {
            setTitle(goal.title);
            setCategory(goal.category);
            setDeadline(format(new Date(goal.deadline), 'yyyy-MM-dd'));
        }
    }, [goal]);

    useEffect(() => {
        if (!goal) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [goal, onCancel]);

    if (!goal) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && deadline) {
            onSave(goal.id, title.trim(), category, new Date(deadline).getTime());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                            <Target size={16} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Goal</h2>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Goal Title</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-accent transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="e.g. Master React Native"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Deadline</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Category</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accent transition-colors"
                        >
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !deadline}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-accent/20"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
