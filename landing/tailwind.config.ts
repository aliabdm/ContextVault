import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        vault: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          50: '#f0f0f7',
          100: '#d0d0e0',
          200: '#a0a0b8',
          300: '#707090',
          400: '#404060',
          500: '#2a2a4a',
          600: '#1a1a35',
          700: '#111128',
          800: '#0d0d1a',
          900: '#080812',
        },
      },
      maxWidth: {
        '8xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
