import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1e3a5f',
          600: '#1a3355',
          700: '#152c4a',
          800: '#112240',
          900: '#0d1b35',
          950: '#091428',
        },
        accent: {
          50: '#fdf4e7',
          100: '#fbe9cf',
          200: '#f7d39f',
          300: '#f3bd6f',
          400: '#efa73f',
          500: '#c8964b',
          600: '#a07a3c',
          700: '#785d2d',
          800: '#50401e',
          900: '#28200f',
        },
        causeway: {
          navy: '#1e3a5f',
          gold: '#c8964b',
          cream: '#faf8f5',
          slate: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Tahoma', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
