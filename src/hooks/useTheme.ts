import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'momentum-theme';

/** Read the initial theme synchronously from localStorage / OS preference. */
function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'dark'; // SSR safety
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    // Default: respect OS dark mode, fall back to dark
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    // Apply theme class to <html> element whenever theme changes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Listen for OS-level preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            // Only follow OS if user hasn't explicitly picked a theme
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'dark');
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, toggleTheme, isDark: theme === 'dark' };
}
