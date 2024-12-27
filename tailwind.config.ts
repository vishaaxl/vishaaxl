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
        "accent-purple": "#f889e7",
        "accent-yellow": "#ffdf2c",
        "accent-green": "#eeee38",
        "accent-beige": "#faebc4",
        "accent-pastel-red": "#FF3D33",
      },
    },
  },
  plugins: [],
};
export default config;
