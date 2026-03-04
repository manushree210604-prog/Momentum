/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0F172A", // slate-900
                card: "#1E293B", // slate-800
                accent: "#8B5CF6", // violet-500
                success: "#22C55E", // green-500
                warning: "#FACC15", // yellow-400
            },
            borderRadius: {
                xl: "16px",
            },
            spacing: {
                section: "24px",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
