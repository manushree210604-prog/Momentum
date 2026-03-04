import { Habit, Goal, UserStats } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, differenceInDays } from 'date-fns';

const HABITS_KEY = 'momentum_habits';
const GOALS_KEY = 'momentum_goals';

export const storage = {
    getHabits: (): Habit[] => {
        const raw = localStorage.getItem(HABITS_KEY);
        return raw ? JSON.parse(raw) : [];
    },
    saveHabits: (habits: Habit[]) => {
        localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    },
    getGoals: (): Goal[] => {
        const raw = localStorage.getItem(GOALS_KEY);
        return raw ? JSON.parse(raw) : [];
    },
    saveGoals: (goals: Goal[]) => {
        localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }
};
