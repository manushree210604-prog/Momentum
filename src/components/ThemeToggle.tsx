import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

export function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={!isDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn(
                // Pill container
                'relative inline-flex h-8 w-[3.25rem] flex-shrink-0 items-center rounded-full',
                'border transition-colors duration-300 focus:outline-none',
                'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
                // Background: amber tint in light, slate in dark
                isDark
                    ? 'bg-slate-700 border-slate-600'
                    : 'bg-amber-100 border-amber-200'
            )}
        >
            {/* Sun icon — visible in dark mode (click to go light) */}
            <Sun
                size={11}
                className={cn(
                    'absolute left-1.5 transition-opacity duration-200 text-amber-400',
                    isDark ? 'opacity-60' : 'opacity-0'
                )}
                aria-hidden="true"
            />

            {/* Moon icon — visible in light mode (click to go dark) */}
            <Moon
                size={11}
                className={cn(
                    'absolute right-1.5 transition-opacity duration-200 text-violet-400',
                    isDark ? 'opacity-0' : 'opacity-60'
                )}
                aria-hidden="true"
            />

            {/* Sliding thumb */}
            <span
                className={cn(
                    // Thumb shape
                    'theme-toggle-thumb absolute flex h-6 w-6 items-center justify-center rounded-full shadow-md',
                    // Thumb background
                    isDark ? 'bg-slate-900' : 'bg-white',
                    // Slide position: left = dark, right = light
                    isDark ? 'translate-x-1' : 'translate-x-[1.625rem]'
                )}
                aria-hidden="true"
            >
                {isDark ? (
                    <Moon size={12} className="text-violet-300" />
                ) : (
                    <Sun size={12} className="text-amber-500" />
                )}
            </span>
        </button>
    );
}
