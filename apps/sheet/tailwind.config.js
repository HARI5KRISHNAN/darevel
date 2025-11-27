/**
 * Tailwind CSS configuration for the Sheet app.
 * Uses CommonJS exports so Tailwind's config loader (jiti) can import it reliably.
 */

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './index.html',
    './App.tsx',
    './src/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './contexts/**/*.{ts,tsx,js,jsx}',
    './services/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

module.exports = config;
