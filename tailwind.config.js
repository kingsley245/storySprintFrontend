// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         brand: {
//           DEFAULT: '#5b46e0', 
//           dark: '#4a37c8',
//           light: '#eeebfe',
//         }
//       }
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5b46e0',
          dark: '#4a37c8',
          light: '#eeebfe',
        }
      }
    },
  },
  plugins: [],
}