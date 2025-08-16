import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Jupiter-inspired color palette
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Jupiter dark theme colors
        jupiter: {
          dark: "#0d0d0d",
          darker: "#0a0a0a",
          surface: "#141414",
          surface2: "#1a1a1a",
          surface3: "#1f1f1f",
          border: "#2a2a2a",
          text: {
            primary: "#ffffff",
            secondary: "#b3b3b3",
            tertiary: "#737373",
          },
          accent: {
            green: "#00d4aa",
            red: "#ff6b6b",
            yellow: "#ffd93d",
            blue: "#4a9eff",
            purple: "#8b5cf6",
          },
        },

        // Status colors matching Jupiter
        success: "#00d4aa",
        danger: "#ff6b6b",
        warning: "#ffd93d",
        info: "#4a9eff",

        // Chart colors
        chart: {
          "1": "#00d4aa",
          "2": "#4a9eff",
          "3": "#8b5cf6",
          "4": "#ffd93d",
          "5": "#ff6b6b",
        },
      },

      fontFamily: {
        // Jupiter uses Inter font family
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },

      boxShadow: {
        jupiter:
          "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        "jupiter-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
      },

      backdropBlur: {
        jupiter: "12px",
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
