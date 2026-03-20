/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'action-primary': {
          DEFAULT: '#0731fa',
          hover: '#0528d4',
        },
        'text-default': '#0d0d0d',
        'text-subdued': '#4c4c4c',
        'text-dark': '#202223',
        'surface-default': '#ffffff',
        'surface-neutral': '#e5e5e5',
        'surface-success-subdued': '#f4f9f6',
        'surface-success': '#a3ceb6',
        'surface-warning': '#f9e7a4',
        'surface-critical': '#f7aaae',
        'surface-waiting': '#fbc7a2',
        'border-default': '#999999',
        'border-subdued': '#cccccc',
        'border-neutral-subdued': '#bfbfbf',
        'border-shadow-subdued': '#b2b2b2',
        'icon-success': '#156a3a',
        'bg-subtle': '#f1f1f1',
        'brand-15': 'rgba(7, 49, 250, 0.15)',
      },
      fontFamily: {
        sans: ["'Cera Pro'", '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
