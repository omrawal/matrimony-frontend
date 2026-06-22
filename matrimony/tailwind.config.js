/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B3D5E', // Premium Matrimonial Rose
          600: '#74314E',
          700: '#5C243D',
          50: '#FDF6F9',
          soft: 'rgba(139, 61, 94, 0.08)'
        },
        amber: {
          wedding: '#D4AF37' // Metallic Gold Accent
        }
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '22px'
      },
      boxShadow: {
        card: '0 10px 30px rgba(139, 61, 94, 0.04)',
        premium: '0 20px 40px rgba(30, 22, 15, 0.06)'
      }
    }
  },
  plugins: [],
}