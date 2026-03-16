import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0731FA",
          "primary-light": "rgba(7, 49, 250, 0.15)",
          "primary-ultra-light": "rgba(7, 49, 250, 0.06)",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subdued: "#F7F7F7",
          pressed: "#E5E5E5",
        },
        border: {
          DEFAULT: "#999999",
          subdued: "#CCCCCC",
          disabled: "#E5E5E5",
          neutral: "#BFBFBF",
        },
        text: {
          DEFAULT: "#0D0D0D",
          subdued: "#4C4C4C",
          muted: "#484848",
          "dark-subdued": "#6C757D",
        },
        success: {
          light: "#A3CEB6",
        },
        ranks: {
          platinum: "#CDCCD9",
        },
        avatars: {
          surface: "#CCCCCC",
          "team-five": "#031464",
        },
        notification: "#570007",
      },
      fontFamily: {
        sans: ['"Cera Pro"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
      boxShadow: {
        card: "0px 4px 6px 0px rgba(0,0,0,0.1), 0px 2px 4px 0px rgba(0,0,0,0.1)",
        button: "0px 1px 0px 0px rgba(0,0,0,0.05)",
        dropdown: "0px 8px 16px 0px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
