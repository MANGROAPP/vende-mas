import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbf7f1",
        ink: "#2c2a28",
        inksoft: "#6b6560",
        muted: "#9c958c",
        line: "#ece4d8",
        card: "#ffffff",
        pastel: {
          blue: "#cfe4f7",
          blueDeep: "#5b8fc7",
          mint: "#cdeee0",
          mintDeep: "#3f9c78",
          peach: "#fbe0d2",
          peachDeep: "#d97b4f",
          yellow: "#faedc4",
          yellowDeep: "#c99a1f",
          pink: "#f8dbe6",
          pinkDeep: "#c85f88",
          lavender: "#e3ddf7",
          lavenderDeep: "#7b68c9",
          red: "#f7d9d6",
          redDeep: "#c14b46",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(44,42,40,0.06)",
        card: "0 4px 20px rgba(44,42,40,0.08)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
