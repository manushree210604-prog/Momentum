import { supabase } from './supabase';
import { Habit, Goal } from '../types';
import { format, subDays } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════
// STREAK CALCULATION  (pure function — works from completedDates[])
// ═══════════════════════════════════════════════════════════════════
export function calculateStreaks(completedDates: string[]): {
    currentStreak: number;
    longestStreak: number;
} {
    if (!completedDates.length) return { currentStreak: 0, longestStreak: 0 };

    const sorted = [...completedDates].sort(); // ascending

    // ── Longest streak ──────────────────────────────────────────
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff =
            (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) /
            86_400_000;
        if (Math.round(diff) === 1) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else if (diff > 1) {
            tempStreak = 1;
        }
    }

    // ── Current streak (count backwards from today or yesterday) ─
    let currentStreak = 0;
    const desc = [...sorted].reverse();
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    if (desc[0] !== today && desc[0] !== yesterday) {
        return { currentStreak: 0, longestStreak };
    }

    let expected = desc[0]; // start from most-recent date
    for (const date of desc) {
        if (date === expected) {
            currentStreak++;
            expected = format(subDays(new Date(expected + 'T00:00:00'), 1), 'yyyy-MM-dd');
        } else {
            break;
        }
    }

    return { currentStreak, longestStreak };
}

// ═══════════════════════════════════════════════════════════════════
// HABITS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchHabits(userId: string): Promise<Habit[]> {
    const { data: habitsData, error: habitsErr } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (habitsErr) throw habitsErr;
    if (!habitsData?.length) return [];

    // Fetch all logs for these habits in one query
    const habitIds = habitsData.map((h) => h.id);
    const { data: logsData, error: logsErr } = await supabase
        .from('habit_logs')
        .select('habit_id, completed_at')
        .in('habit_id', habitIds)
        .eq('user_id', userId);

    if (logsErr) throw logsErr;

    // Build a map: habitId → completedDates[]
    const logsMap: Record<string, string[]> = {};
    (logsData || []).forEach((log) => {
        if (!logsMap[log.habit_id]) logsMap[log.habit_id] = [];
        logsMap[log.habit_id].push(log.completed_at as string);
    });

    return habitsData.map((h) => {
        const completedDates = logsMap[h.id] || [];
        const { currentStreak, longestStreak } = calculateStreaks(completedDates);
        return {
            id: h.id as string,
            title: h.title as string,
            category: h.category as string,
            createdAt: new Date(h.created_at as string).getTime(),
            completedDates,
            currentStreak,
            longestStreak,
        };
    });
}

export async function dbInsertHabit(
    userId: string,
    title: string,
    category: string
): Promise<Habit> {
    const { data, error } = await supabase
        .from('habits')
        .insert({ user_id: userId, title, category })
        .select()
        .single();

    if (error) throw error;
    return {
        id: data.id,
        title: data.title,
        category: data.category,
        createdAt: new Date(data.created_at).getTime(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
    };
}

export async function dbUpdateHabit(
    id: string,
    title: string,
    category: string
): Promise<void> {
    const { error } = await supabase
        .from('habits')
        .update({ title, category })
        .eq('id', id);
    if (error) throw error;
}

export async function dbSoftDeleteHabit(id: string): Promise<void> {
    const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', id);
    if (error) throw error;
}

export async function dbToggleHabitLog(
    userId: string,
    habitId: string,
    dateStr: string,
    isCurrentlyCompleted: boolean
): Promise<void> {
    if (isCurrentlyCompleted) {
        const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId)
            .eq('user_id', userId)
            .eq('completed_at', dateStr);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('habit_logs')
            .upsert({ habit_id: habitId, user_id: userId, completed_at: dateStr });
        if (error) throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════
// GOALS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((g) => ({
        id: g.id as string,
        title: g.title as string,
        category: g.category as string,
        deadline: Number(g.deadline),
        progress: g.progress as number,
        status: g.status as 'In Progress' | 'Completed',
        createdAt: new Date(g.created_at as string).getTime(),
    }));
}

export async function dbInsertGoal(
    userId: string,
    title: string,
    category: string,
    deadline: number
): Promise<Goal> {
    const { data, error } = await supabase
        .from('goals')
        .insert({ user_id: userId, title, category, deadline, progress: 0, status: 'In Progress' })
        .select()
        .single();

    if (error) throw error;
    return {
        id: data.id,
        title: data.title,
        category: data.category,
        deadline: Number(data.deadline),
        progress: data.progress,
        status: data.status,
        createdAt: new Date(data.created_at).getTime(),
    };
}

export async function dbUpdateGoal(
    id: string,
    title: string,
    category: string,
    deadline: number
): Promise<void> {
    const { error } = await supabase
        .from('goals')
        .update({ title, category, deadline })
        .eq('id', id);
    if (error) throw error;
}

export async function dbUpdateGoalProgress(
    id: string,
    progress: number,
    status: string
): Promise<void> {
    const { error } = await supabase
        .from('goals')
        .update({ progress, status })
        .eq('id', id);
    if (error) throw error;
}

export async function dbDeleteGoal(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════════
// USER PROFILE SYNC (XP / Level / Streak → profiles table)
// ═══════════════════════════════════════════════════════════════════

export async function dbSyncProfile(
    userId: string,
    xp: number,
    level: number,
    currentStreak: number,
    longestStreak: number
): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({
            xp,
            level,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            last_active_date: format(new Date(), 'yyyy-MM-dd'),
        })
        .eq('id', userId);
    // Non-critical — log but don't throw
    if (error) console.warn('[profile sync]', error.message);
}

// ═══════════════════════════════════════════════════════════════════
// ONE-TIME MIGRATION: localStorage → Supabase
// Runs once per user account. Safe to call on every login.
// ═══════════════════════════════════════════════════════════════════

export async function migrateIfNeeded(userId: string): Promise<void> {
    const migrationKey = `momentum_migrated_${userId}`;
    if (localStorage.getItem(migrationKey)) return;

    const rawHabits = localStorage.getItem('momentum_habits');
    const rawGoals = localStorage.getItem('momentum_goals');

    if (!rawHabits && !rawGoals) {
        localStorage.setItem(migrationKey, 'true');
        return;
    }

    console.log('🔄 Migrating localStorage data to Supabase…');

    const localHabits: Habit[] = JSON.parse(rawHabits || '[]');
    const localGoals: Goal[] = JSON.parse(rawGoals || '[]');

    // Migrate habits + their completion logs
    for (const habit of localHabits) {
        try {
            const { data: newHabit, error } = await supabase
                .from('habits')
                .insert({ user_id: userId, title: habit.title, category: habit.category })
                .select()
                .single();

            if (error) { console.warn('Migration: skip habit', habit.title, error.message); continue; }

            if (newHabit && habit.completedDates?.length) {
                const logs = habit.completedDates.map((date) => ({
                    habit_id: newHabit.id,
                    user_id: userId,
                    completed_at: date,
                }));
                await supabase.from('habit_logs').upsert(logs, { ignoreDuplicates: true });
            }
        } catch (e) {
            console.warn('Migration: skip habit', habit.title, e);
        }
    }

    // Migrate goals
    for (const goal of localGoals) {
        try {
            await supabase.from('goals').insert({
                user_id: userId,
                title: goal.title,
                category: goal.category,
                deadline: goal.deadline,
                progress: goal.progress,
                status: goal.status,
            });
        } catch (e) {
            console.warn('Migration: skip goal', goal.title, e);
        }
    }

    // Mark done + clean up localStorage app data
    localStorage.setItem(migrationKey, 'true');
    localStorage.removeItem('momentum_habits');
    localStorage.removeItem('momentum_goals');

    console.log('✅ Migration complete — data now lives in Supabase');
}
