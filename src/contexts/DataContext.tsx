import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit, Goal, UserStats } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, differenceInDays } from 'date-fns';
import { storage } from '../lib/storage';

interface DataContextType {
    habits: Habit[];
    goals: Goal[];
    stats: UserStats;
    addHabit: (title: string, category: string) => void;
    deleteHabit: (id: string) => void;
    toggleHabitDate: (id: string, dateStr: string) => void;
    addGoal: (title: string, category: string, deadline: number) => void;
    updateGoalProgress: (id: string, progress: number) => void;
    deleteGoal: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    useEffect(() => {
        setHabits(storage.getHabits());
        setGoals(storage.getGoals());
    }, []);

    const stats = React.useMemo(() => {
        let xp = 0;
        habits.forEach(h => {
            xp += h.completedDates.length * 20;
        });
        goals.forEach(g => {
            if (g.status === 'Completed') {
                xp += 50;
            }
        });
        return {
            xp,
            level: Math.floor(xp / 100) + 1,
            badges: []
        };
    }, [habits, goals]);

    const addHabit = (title: string, category: string) => {
        const newHabit: Habit = {
            id: uuidv4(),
            title,
            category,
            createdAt: Date.now(),
            completedDates: [],
            currentStreak: 0,
            longestStreak: 0
        };
        const updated = [...habits, newHabit];
        setHabits(updated);
        storage.saveHabits(updated);
    };

    const deleteHabit = (id: string) => {
        const updated = habits.filter(h => h.id !== id);
        setHabits(updated);
        storage.saveHabits(updated);
    };

    const toggleHabitDate = (id: string, dateStr: string) => {
        const updated = habits.map(h => {
            if (h.id === id) {
                const isCompleted = h.completedDates.includes(dateStr);
                let newDates = [...h.completedDates];
                if (isCompleted) {
                    newDates = newDates.filter(d => d !== dateStr);
                } else {
                    newDates.push(dateStr);
                }

                // Calculate continuous streak from today backwards
                let currentStreak = 0;
                let d = new Date(); // Start finding streak
                while (true) {
                    const checkDate = format(d, 'yyyy-MM-dd');
                    if (newDates.includes(checkDate)) {
                        currentStreak++;
                        d = subDays(d, 1);
                    } else {
                        // Check if streak was broken yesterday or if it's just today pending
                        if (currentStreak === 0 && format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
                            d = subDays(d, 1);
                            if (newDates.includes(format(d, 'yyyy-MM-dd'))) {
                                currentStreak++;
                                d = subDays(d, 1);
                                continue;
                            }
                        }
                        break;
                    }
                }

                const longestStreak = Math.max(h.longestStreak, currentStreak);
                return { ...h, completedDates: newDates, currentStreak, longestStreak };
            }
            return h;
        });
        setHabits(updated);
        storage.saveHabits(updated);
    };

    const addGoal = (title: string, category: string, deadline: number) => {
        const newGoal: Goal = {
            id: uuidv4(),
            title,
            category,
            deadline,
            progress: 0,
            status: 'In Progress',
            createdAt: Date.now()
        };
        const updated = [...goals, newGoal];
        setGoals(updated);
        storage.saveGoals(updated);
    };

    const updateGoalProgress = (id: string, progress: number) => {
        const updated = goals.map(g => {
            if (g.id === id) {
                const newProgress = Math.min(Math.max(progress, 0), 100);
                const status: 'Completed' | 'In Progress' = newProgress === 100 ? 'Completed' : 'In Progress';

                return { ...g, progress: newProgress, status };
            }
            return g;
        });
        setGoals(updated);
        storage.saveGoals(updated);
    };

    const deleteGoal = (id: string) => {
        const updated = goals.filter(g => g.id !== id);
        setGoals(updated);
        storage.saveGoals(updated);
    };

    return (
        <DataContext.Provider value={{
            habits, goals, stats, addHabit, deleteHabit, toggleHabitDate, addGoal, updateGoalProgress, deleteGoal
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useDataContext must be used within DataProvider");
    return context;
};
