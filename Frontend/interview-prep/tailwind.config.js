/** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // This scans all your React components for classes
      ],
      theme: {
        extend: {
          fontFamily: {
            // This matches your index.css import
            urbanist: ['Urbanist', 'sans-serif'], 
          }
        },
      },
      plugins: [],
    }