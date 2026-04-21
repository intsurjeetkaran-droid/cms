/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          violet:  "#7C3AED",
          cyan:    "#06B6D4",
          coral:   "#F43F5E",
          amber:   "#F59E0B",
          dark:    "#0A0A0F",
          darker:  "#06060A",
          surface: "#111118",
          card:    "#16161F",
          border:  "#1E1E2E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #7C3AED, #06B6D4)",
        "gradient-hot":    "linear-gradient(135deg, #F43F5E, #F59E0B)",
        "gradient-violet": "linear-gradient(135deg, #7C3AED, #A855F7)",
        "gradient-dark":   "linear-gradient(135deg, #0A0A0F, #111118)",
      },
      boxShadow: {
        "glow-violet": "0 0 30px #7C3AED44",
        "glow-cyan":   "0 0 30px #06B6D444",
        "glow-coral":  "0 0 30px #F43F5E44",
        "glow-sm":     "0 0 15px #7C3AED33",
      },
      animation: {
        "float":       "float 6s ease-in-out infinite",
        "float2":      "float2 8s ease-in-out infinite",
        "spin-slow":   "spin-slow 12s linear infinite",
        "morph":       "morph 8s ease-in-out infinite",
        "slide-up":    "slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":     "fade-in 0.6s ease forwards",
        "bounce-in":   "bounce-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
}
