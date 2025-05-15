import type { Config } from 'tailwindcss'

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#FE7743",
        bg: "#EFEEEA",
        dark: "#273F4F",
        black: "#000000",
      },
    },
  },
  plugins: [],
}

export default config;
