/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'DM Sans'",   'sans-serif'],
        display: ["'Barlow'",    'sans-serif'],
        mono:    ["'Fira Mono'", 'monospace'],
      },
      colors: {
        primary:            '#FF5C3A',
        'menu-bg':          '#0f0f0f',
        'menu-surface':     '#141414',
        'menu-surface-lt':  '#1c1c1c',
        'menu-error':       '#6e1616',
        'menu-error-lt':    '#a13434',
        'menu-success':     '#52984a',
        'menu-success-lt':  '#60eb50',
        'menu-warning':     '#f09348',
        'menu-border':      'rgba(255,255,255,0.23)',
      },
    },
  },
  plugins: [],
}
