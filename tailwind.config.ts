import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mist: {
          50: "#f6fbfb",
          100: "#e6f5f3",
          200: "#cdebe8",
          300: "#a8dbd5",
          500: "#61b9ae",
          700: "#377c76"
        },
        blossom: {
          50: "#fff7f8",
          100: "#ffe9ee",
          200: "#ffd4dd",
          300: "#f9afbe",
          500: "#e97793"
        },
        skywash: {
          50: "#f5fbff",
          100: "#e8f5ff",
          200: "#d3ebfb",
          500: "#72b5dd",
          700: "#367ea5"
        },
        cream: {
          50: "#fffdf6",
          100: "#fbf5df"
        }
      },
      boxShadow: {
        soft: "0 22px 60px rgba(83, 116, 128, 0.12)",
        card: "0 12px 32px rgba(99, 125, 136, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
