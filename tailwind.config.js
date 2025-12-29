/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional Color System (Power BI-inspired)
        'primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0078D4',  // Professional blue (main)
          600: '#0066b8',
          700: '#00549c',
          800: '#004280',
          900: '#003064',
        },
        'navy': {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#1B2B44',  // Deep navy (primary bg)
          950: '#0F172A',  // Slate (darkest)
        },
        'teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#008575',  // Professional teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Data visualization palette
        'chart': {
          blue: '#0078D4',
          teal: '#008575',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E',
          violet: '#8B5CF6',
          orange: '#F97316',
          cyan: '#06B6D4',
        },
        // UI state colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#0078D4',
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['24px', { lineHeight: '32px' }],
        '2xl': ['32px', { lineHeight: '40px' }],
        '3xl': ['40px', { lineHeight: '48px' }],
      },
      spacing: {
        '18': '72px',
        '88': '352px',
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
        'topbar': '64px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'count-up': 'countUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      transitionDuration: {
        '250': '250ms',
      }
    },
  },
  plugins: [],
}
