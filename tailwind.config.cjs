/** @type {import('tailwindcss').Config} */
module.exports = {
    // Enable class-based dark mode — 'dark' class on <html> activates dark: variants
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-primary)',
                card: 'var(--bg-secondary)',
                sidebar: 'var(--bg-sidebar)',
                // Modern, vibrant palette
                accent: {
                  DEFAULT: '#6366F1', // Indigo 500
                  hover: '#4F46E5',   // Indigo 600
                  soft: 'rgba(99, 102, 241, 0.15)',
                },
                success: {
                    DEFAULT: '#10B981', // Emerald 500
                    soft: 'rgba(16, 185, 129, 0.15)',
                },
                warning: {
                    DEFAULT: '#F59E0B', // Amber 500
                    soft: 'rgba(245, 158, 11, 0.15)',
                },
                danger: {
                    DEFAULT: '#EF4444', // Red 500
                    soft: 'rgba(239, 68, 68, 0.15)',
                }
            },
            borderRadius: {
                '3xl': '24px',
                '2xl': '18px',
                'xl': '14px',
            },
            spacing: {
                section: '32px',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
                'premium-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 10px 20px -10px rgba(0, 0, 0, 0.3)',
            }
        },
    },
    plugins: [],
}
