/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vpnxo': {
          primary: '#1e40af',
          secondary: '#3b82f6',
          dark: '#1e293b',
          green: '#10b981',
          orange: '#f97316',
          red: '#ef4444',
          blue: '#3b82f6',
        },
        'cyber': {
          green: '#00FF88',
          cyan: '#00E5FF',
          red: '#FF0055',
          dark: '#0A0F1C',
          hover: '#1A2133',
          card: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



