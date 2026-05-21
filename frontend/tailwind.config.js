/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0d1b22",
          secondary: "#142026",
          tertiary: "#0f1a20",
        },
        card: {
          DEFAULT: "#1a2d38",
          dark: "#1e3444",
        },
        accent: {
          DEFAULT: "#3B657A",
          light: "#4a7d96",
        },
        brand: {
          gold: "#c8a96e",
          cream: "#FFFAE2",
          muted: "#8aacba",
        },
        status: {
          danger: "#e55353",
          warn: "#e5a03b",
          safe: "#3bc9a0",
        },
      },
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(59,101,122,0.35)",
      },
      animation: {
        pulse2: "pulse2 1.4s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease forwards",
        "fade-up": "fadeUp 0.4s ease forwards",
      },
      keyframes: {
        pulse2: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".4", transform: "scale(.8)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "status-danger":
          "linear-gradient(145deg,#2a0a0a 0%,#1a1020 40%,#0d1f2e 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(26,45,56,0.9) 0%, rgba(30,52,68,0.7) 100%)",
      },
    },
  },
  plugins: [],
};
