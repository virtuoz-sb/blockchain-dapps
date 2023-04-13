/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./components/**/*.{js,ts,jsx,tsx}', './layout/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary-default)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        secondary: 'var(--color-secondary)',
        'primary-text': 'var(--text-primary)',
        'secondary-text': 'var(--text-secondary)',
        'hover-border': 'var(--color-hover-border, var(--color-primary-500))',
        disabled: 'var(--color-disabled, var(--color-primary-400))',
        'hover-disabled': 'var(--color-hover-disabled, var(--color-primary-500))',
        blue: {
          DEFAULT: '#4583FF',
          300: '#4998ED',
          500: '#4583FF',
          600: '#325DB3',
          700: '#2E3D64',
          900: '#212945',
        },
        market: 'var(--color-market)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
