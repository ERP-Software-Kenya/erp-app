/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3b74f5',
        'primary-dark': '#1d4ed8',
        navy: '#0d1b3e',
        cyan: '#09b6e8',
        surface: '#f0f4f8',
        border: '#dde5f0',
        muted: '#64748b',
        destructive: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
};
