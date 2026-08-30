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
        surface: '#0b1220',
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
          'var(--font-inter)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.30), 0 1px 3px 0 rgba(0,0,0,0.20)',
        'card-hover': '0 4px 12px -2px rgba(0,0,0,0.45), 0 2px 6px -2px rgba(0,0,0,0.30)',
        popover: '0 12px 32px -8px rgba(0,0,0,0.65), 0 0 0 1px rgba(30,41,59,0.6)',
        'focus-emerald': '0 0 0 3px rgba(52,211,153,0.20)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.18s ease-out',
        'overlay-in': 'fadeIn 0.2s ease-out',
        'modal-in': 'modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'drawer-in': 'drawerIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.16s ease-out',
      },
      keyframes: {
        glowEmerald: {
          '0%': { boxShadow: '0 0 10px rgba(52, 211, 153, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(52, 211, 153, 0.35)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        modalIn: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        drawerIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
