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
                // These two are CSS-variable–driven so they flip automatically with the theme.
                // They do NOT use opacity modifiers in the codebase, so this is safe.
                background: 'var(--bg-primary)',
                card: 'var(--bg-secondary)',
                sidebar: 'var(--bg-sidebar)',
                // Static values — used with opacity modifiers (/10, /20 etc.) so they stay fixed
                accent: '#8B5CF6',
                success: '#22C55E',
                warning: '#FACC15',
            },
            borderRadius: {
                xl: '16px',
            },
            spacing: {
                section: '24px',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
