export interface Habit {
    id: string;
    title: string;
    category: string;
    createdAt: number;
    completedDates: string[]; // store as 'yyyy-MM-dd'
    currentStreak: number;
    longestStreak: number;
}

export interface Goal {
    id: string;
    title: string;
    category: string;
    deadline: number;
    progress: number; // 0 to 100
    status: 'In Progress' | 'Completed';
    createdAt: number;
}

export interface UserStats {
    xp: number;
    level: number;
    badges: string[];
}

export type Category = 'Study' | 'Health' | 'Productivity' | 'Personal';
