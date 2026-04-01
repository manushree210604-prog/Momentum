import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { Habit, Goal, UserStats } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';
import { useAuth } from './AuthContext';
import {
    dbFetchHabits,
    dbInsertHabit,
    dbUpdateHabit,
    dbSoftDeleteHabit,
    dbToggleHabitLog,
    dbFetchGoals,
    dbInsertGoal,
    dbUpdateGoal,
    dbUpdateGoalProgress,
    dbDeleteGoal,
    dbSyncProfile,
    calculateStreaks,
    migrateIfNeeded,
} from '../lib/supabaseData';

// ── Context shape (identical to before — no component changes needed) ─
interface DataContextType {
    habits: Habit[];
    goals: Goal[];
    stats: UserStats;
    loading: boolean;
    addHabit: (title: string, category: string) => void;
    editHabit: (id: string, title: string, category: string) => void;
    deleteHabit: (id: string) => void;
    toggleHabitDate: (id: string, dateStr: string) => void;
    addGoal: (title: string, category: string, deadline: number) => void;
    editGoal: (id: string, title: string, category: string, deadline: number) => void;
    updateGoalProgress: (id: string, progress: number) => void;
    deleteGoal: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // ── Load from Supabase whenever the authenticated user changes ──
    useEffect(() => {
        if (!user) {
            setHabits([]);
            setGoals([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                // Run one-time migration for users who had localStorage data
                await migrateIfNeeded(user.id);

                const [h, g] = await Promise.all([
                    dbFetchHabits(user.id),
                    dbFetchGoals(user.id),
                ]);

                if (!cancelled) {
                    setHabits(h);
                    setGoals(g);
                }
            } catch (e) {
                console.error('Failed to load data from Supabase:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [user?.id]);

    // ── Stats: computed from local React state (same logic as before) ─
    const stats = React.useMemo((): UserStats => {
        let xp = 0;
        habits.forEach((h) => { xp += h.completedDates.length * 20; });
        goals.forEach((g) => { if (g.status === 'Completed') xp += 50; });
        return {
            xp,
            level: Math.floor(xp / 100) + 1,
            badges: [],
        };
    }, [habits, goals]);

    // ── Persist stats to Supabase profiles whenever they change ─────
    useEffect(() => {
        if (!user || loading) return;
        let currentStreak = 0;
        let longestStreak = 0;
        habits.forEach((h) => {
            if (h.currentStreak > currentStreak) currentStreak = h.currentStreak;
            if (h.longestStreak > longestStreak) longestStreak = h.longestStreak;
        });
        dbSyncProfile(user.id, stats.xp, stats.level, currentStreak, longestStreak);
    }, [stats.xp, stats.level, habits, user?.id, loading]);

    // ════════════════════════════════════════════════════════════════
    // HABIT MUTATIONS — optimistic update + async Supabase persist
    // ════════════════════════════════════════════════════════════════

    const addHabit = useCallback((title: string, category: string) => {
        // Optimistic: add immediately with a temp ID
        const tempId = `temp-${uuidv4()}`;
        const optimistic: Habit = {
            id: tempId, title, category,
            createdAt: Date.now(),
            completedDates: [], currentStreak: 0, longestStreak: 0,
        };
        setHabits((prev) => [...prev, optimistic]);

        if (!user) return;
        dbInsertHabit(user.id, title, category)
            .then((real) => {
                // Replace temp with real DB row (real UUID)
                setHabits((prev) => prev.map((h) => h.id === tempId ? real : h));
            })
            .catch((e) => {
                console.error('addHabit failed:', e);
                setHabits((prev) => prev.filter((h) => h.id !== tempId)); // revert
            });
    }, [user]);

    const editHabit = useCallback((id: string, title: string, category: string) => {
        setHabits((prev) => prev.map((h) => h.id === id ? { ...h, title, category } : h));
        dbUpdateHabit(id, title, category).catch(console.error);
    }, []);

    const deleteHabit = useCallback((id: string) => {
        setHabits((prev) => prev.filter((h) => h.id !== id));
        dbSoftDeleteHabit(id).catch(console.error);
    }, []);

    const toggleHabitDate = useCallback((id: string, dateStr: string) => {
        setHabits((prev) =>
            prev.map((h) => {
                if (h.id !== id) return h;

                const isCompleted = h.completedDates.includes(dateStr);
                const newDates = isCompleted
                    ? h.completedDates.filter((d) => d !== dateStr)
                    : [...h.completedDates, dateStr];

                const { currentStreak, longestStreak } = calculateStreaks(newDates);

                // Async persist to Supabase (fire-and-forget)
                if (user && !id.startsWith('temp-')) {
                    dbToggleHabitLog(user.id, id, dateStr, isCompleted).catch(console.error);
                }

                return {
                    ...h,
                    completedDates: newDates,
                    currentStreak,
                    longestStreak: Math.max(h.longestStreak, longestStreak),
                };
            })
        );
    }, [user]);

    // ════════════════════════════════════════════════════════════════
    // GOAL MUTATIONS — optimistic update + async Supabase persist
    // ════════════════════════════════════════════════════════════════

    const addGoal = useCallback((title: string, category: string, deadline: number) => {
        const tempId = `temp-${uuidv4()}`;
        const optimistic: Goal = {
            id: tempId, title, category, deadline,
            progress: 0, status: 'In Progress', createdAt: Date.now(),
        };
        setGoals((prev) => [...prev, optimistic]);

        if (!user) return;
        dbInsertGoal(user.id, title, category, deadline)
            .then((real) => {
                setGoals((prev) => prev.map((g) => g.id === tempId ? real : g));
            })
            .catch((e) => {
                console.error('addGoal failed:', e);
                setGoals((prev) => prev.filter((g) => g.id !== tempId));
            });
    }, [user]);

    const editGoal = useCallback(
        (id: string, title: string, category: string, deadline: number) => {
            setGoals((prev) =>
                prev.map((g) => g.id === id ? { ...g, title, category, deadline } : g)
            );
            dbUpdateGoal(id, title, category, deadline).catch(console.error);
        },
        []
    );

    const updateGoalProgress = useCallback((id: string, progress: number) => {
        setGoals((prev) =>
            prev.map((g) => {
                if (g.id !== id) return g;
                const newProgress = Math.min(Math.max(progress, 0), 100);
                const status: 'Completed' | 'In Progress' =
                    newProgress === 100 ? 'Completed' : 'In Progress';
                dbUpdateGoalProgress(id, newProgress, status).catch(console.error);
                return { ...g, progress: newProgress, status };
            })
        );
    }, []);

    const deleteGoal = useCallback((id: string) => {
        setGoals((prev) => prev.filter((g) => g.id !== id));
        dbDeleteGoal(id).catch(console.error);
    }, []);

    return (
        <DataContext.Provider
            value={{
                habits, goals, stats, loading,
                addHabit, editHabit, deleteHabit, toggleHabitDate,
                addGoal, editGoal, updateGoalProgress, deleteGoal,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useDataContext must be used within DataProvider');
    return context;
};
