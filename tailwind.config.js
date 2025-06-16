/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light", 
      "dark", 
      "forest",
      {
        zimablue: {
          "primary": "#1e40af",
          "secondary": "#0284c7",
          "accent": "#0ea5e9",
          "neutral": "#1f2937",
          "base-100": "#f3f4f6",
          "info": "#06b6d4",
          "success": "#22c55e",
          "warning": "#fbbf24",
          "error": "#ef4444",
        },
      },
    ],
  },
}
