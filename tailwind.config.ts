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
        brightYellow: "#fce849",
        fadedBlack: "#1f1f1f",
        brightNeonGreen: "#9aef5e",
        fadedRed: "#d74337",
        fadedBlue: "#b6cff8",
        brightOrange: "#d9744c",
      },
      borderRadius: {
        md: "80px",
        sm: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
