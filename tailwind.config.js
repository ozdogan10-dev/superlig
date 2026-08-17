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
        background: "var(--background)",
        foreground: "var(--foreground)",
        ch1: "#f5efe6", // Light Beige/Off-white
        ch2: "#e8dfca", // Beige
        ch3: "#aebdca", // Light Slate Blue
        ch4: "#7895b2", // Medium Slate Blue
      },
    },
  },
  plugins: [],
};
