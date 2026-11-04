import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mupho: {
          // Primary Brand Tones
          blue: {
            DEFAULT: "#033B76", // Deep brand navy
            slate: "#1A365D",   // Window category dark blue
            light: "#0082C8",   // Laundry category bright blue
          },
          yellow: {
            DEFAULT: "#F9C80E", // Vibrant brand yellow
            bright: "#FFF200",  // Ultra-bright alert yellow
            ochre: "#C68A14",   // Floor category warm gold
          },
          // Utility Category Tones
          green: {
            garden: "#316A3A",  // Gardening category deep green
          }
        },
      },
      fontFamily: {
        // Display Headings (Logo, Section Headers)
        heading: ["var(--font-montserrat)", "sans-serif"],
        // Clean Body Text
        body: ["var(--font-inter)", "sans-serif"],
        // Organic Script Accent ("Clean Spaces, Happy Lives")
        script: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
