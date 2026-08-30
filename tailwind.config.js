/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617', // slate-950
        card: '#0f172a', // slate-900
        'card-border': '#1e293b', // slate-800
        'accent-emerald': '#34d399', // emerald-400
        'accent-rose': '#fb7185', // rose-400
        'accent-amber': '#fbbf24', // amber-400
        'accent-sky': '#38bdf8', // sky-400
        'accent-indigo': '#818cf8', // indigo-400
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowEmerald: {
          '0%': { boxShadow: '0 0 10px rgba(52, 211, 153, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(52, 211, 153, 0.35)' },
        },
      },
    },
  },
  plugins: [],
}
