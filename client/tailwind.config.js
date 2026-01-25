/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ===== COLOR PALETTE =====
      colors: {
        // Orange (Primary Brand)
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // Main brand orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Black (Secondary)
        black: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#000000',
        },
        // Yellow (Accent)
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',  // Main accent yellow
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        // Semantic Colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      
      // ===== TYPOGRAPHY =====
      fontFamily: {
        sans: ["'Inter'", "'Segoe UI'", 'Roboto', '-apple-system', 'sans-serif'],
        heading: ["'Montserrat'", "'Arial Narrow'", 'sans-serif'],
        accent: ["'Oswald'", "'Impact'", 'sans-serif'],
      },
      
      // ===== GRADIENTS =====
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
        'gradient-energy': 'linear-gradient(135deg, #f97316 0%, #facc15 50%, #f97316 100%)',
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #c2410c 100%)',
      },
      
      // ===== SHADOWS =====
      boxShadow: {
        'orange': '0 10px 15px -3px rgba(249, 115, 22, 0.1), 0 4px 6px -2px rgba(249, 115, 22, 0.05)',
        'accent': '0 10px 15px -3px rgba(250, 204, 21, 0.1), 0 4px 6px -2px rgba(250, 204, 21, 0.05)',
      },
      
      // ===== ANIMATIONS =====
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}