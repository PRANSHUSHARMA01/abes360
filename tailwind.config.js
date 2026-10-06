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
        supabase: {
          bg: '#0c0d0e',
          card: '#121315',
          cardHover: '#18191c',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(62, 207, 142, 0.4)',
          emerald: '#3ecf8e',
          emeraldDark: '#249e6b',
          emeraldGlow: 'rgba(62, 207, 142, 0.15)',
          muted: '#889096',
          text: '#ededed',
          subtext: '#9ba1a6',
          labAccent: '#ec4899',
          tutorialAccent: '#3b82f6',
          lectureAccent: '#10b981',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(rgba(62, 207, 142, 0.12) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(62, 207, 142, 0.25), rgba(255, 255, 255, 0))',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(62, 207, 142, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(62, 207, 142, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
