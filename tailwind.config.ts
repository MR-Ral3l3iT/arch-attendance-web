import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50:  "#fff0f0",
          100: "#ffdddd",
          200: "#ffc0c0",
          300: "#ff9494",
          400: "#ff5757",
          500: "#ff2323",
          600: "#c80b11",
          700: "#a80a0f",
          800: "#8b0d12",
          900: "#731115",
          950: "#3f0306",
          DEFAULT: "#c80b11",
        },
        success: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          DEFAULT: "#16a34a",
        },
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          DEFAULT: "#d97706",
        },
        danger: {
          50:  "#fff0f0",
          100: "#ffdddd",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          DEFAULT: "#dc2626",
        },
        info: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          DEFAULT: "#2563eb",
        },
        attendance: {
          "on-time": "#16a34a",
          "late":    "#d97706",
          "absent":  "#dc2626",
          "leave":   "#2563eb",
          "not-checked": "#9ca3af",
        },
      },
      fontFamily: {
        sans: ["var(--font-prompt)", "Prompt", "sans-serif"],
        prompt: ["var(--font-prompt)", "Prompt", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)",
        "card-md": "0 4px 6px -1px rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};
export default config;
