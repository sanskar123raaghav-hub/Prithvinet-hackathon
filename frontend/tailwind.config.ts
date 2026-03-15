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
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Government palette
        gov: {
          blue:      "#0b3d91",   // primary deep blue
          "blue-light": "#1a56b0",
          green:     "#2a9d8f",   // secondary sea green
          "green-light": "#3bbfb0",
          accent:    "#e6f0ff",   // light blue tint
          gray:      "#f3f4f6",   // footer / muted bg
          border:    "#e5e7eb",
        },

        // Keep accent aliases so existing pages don't crash
        accent: {
          cyan:  "#2a9d8f",
          green: "#2a9d8f",
          blue:  "#0b3d91",
        },

        // Navy aliases → mapped to white/light so dark cards become light
        navy: {
          900: "#ffffff",
          800: "#f9fafb",
          700: "#f3f4f6",
          600: "#e5e7eb",
        },
      },

      fontFamily: {
        mono: ["var(--font-geist-mono)", "monospace"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },

      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(11,61,145,0.1)",
        navbar: "0 1px 4px rgba(0,0,0,0.08)",
      },

      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
