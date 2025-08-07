/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Couleurs AB CAMPUS FINANCE selon la charte graphique
          primary: {
            // Jaune doré (Golden Yellow)
            50: '#fefbf0',
            100: '#fdf7e0',
            200: '#fbecc0',
            300: '#f8e090',
            400: '#f5d460',
            500: '#c8ac44', // Couleur principale
            600: '#b19a3d',
            700: '#9a8836',
            800: '#83762f',
            900: '#6c6428',
          },
          secondary: {
            // Bleu charbon (Charcoal Blue)
            50: '#f5f6f7',
            100: '#e6e8eb',
            200: '#c7ccd3',
            300: '#a8b0bb',
            400: '#8994a3',
            500: '#6a788b',
            600: '#5b687a',
            700: '#4c5869',
            800: '#3d4858',
            900: '#353d55', // Couleur principale
          },
          accent: {
            // Argent Clair (Light Silver)
            50: '#fcfcfd',
            100: '#f8f9fa',
            200: '#f1f3f4',
            300: '#e8eaed',
            400: '#e3e6e8', // Couleur principale
            500: '#d1d5db',
            600: '#9ca3af',
            700: '#6b7280',
            800: '#4b5563',
            900: '#374151',
          },
          neutral: {
            // Gris clair (Light Grey)
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#212121', // Couleur principale
          }
        },
        fontFamily: {
          'sans': ['Montserrat', 'system-ui', 'sans-serif'],
          'montserrat': ['Montserrat', 'sans-serif'],
        },
        fontSize: {
          'xs': ['0.75rem', { lineHeight: '1rem' }],
          'sm': ['0.875rem', { lineHeight: '1.25rem' }],
          'base': ['1rem', { lineHeight: '1.5rem' }],
          'lg': ['1.125rem', { lineHeight: '1.75rem' }],
          'xl': ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
          '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
          '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
          '5xl': ['3rem', { lineHeight: '1' }],
          '6xl': ['3.75rem', { lineHeight: '1' }],
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        borderRadius: {
          'xl': '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
        },
        boxShadow: {
          'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
          'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        }
      },
    },
    plugins: [],
  }