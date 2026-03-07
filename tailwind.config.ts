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
        // Core neutrals
        cream: {
          DEFAULT: "#F7F3EE",
          50: "#FFFDF9",
          100: "#F7F3EE",
          200: "#EFE7DD",
          300: "#DDD3C7",
        },
        // Primary text
        ink: {
          DEFAULT: "#1F1D1A",
          secondary: "#6B645C",
        },
        // Brand accents
        terracotta: {
          DEFAULT: "#C96E4B",
          hover: "#B45D3C",
          light: "#F5E0D6",
        },
        dusty: {
          blue: "#7F9BB3",
          "blue-light": "#E8EFF5",
        },
        sage: {
          DEFAULT: "#8EAA92",
          light: "#E5EDE6",
        },
        mustard: {
          DEFAULT: "#D9B25F",
          light: "#F5EDD4",
        },
        coral: {
          DEFAULT: "#D98B73",
          light: "#F5DDD5",
        },
        // Semantic
        success: {
          DEFAULT: "#4D8C65",
          light: "#E5F0EA",
        },
        warning: {
          DEFAULT: "#C48A2C",
          light: "#F5EBD4",
        },
        error: {
          DEFAULT: "#B65252",
          light: "#F5DEDE",
        },
        info: {
          DEFAULT: "#5B7FA3",
          light: "#E0EAF2",
        },
      },
      fontFamily: {
        display: ["Poppins", "DM Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "72px", fontWeight: "600" }],
        "display-l": ["52px", { lineHeight: "60px", fontWeight: "600" }],
        h1: ["40px", { lineHeight: "48px", fontWeight: "600" }],
        h2: ["32px", { lineHeight: "40px", fontWeight: "600" }],
        h3: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        h4: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-l": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-m": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-s": ["14px", { lineHeight: "22px", fontWeight: "400" }],
        label: ["13px", { lineHeight: "18px", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      spacing: {
        4.5: "18px",
        13: "52px",
        15: "60px",
        18: "72px",
        22: "88px",
        30: "120px",
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(31, 29, 26, 0.06)",
        "card-hover": "0 12px 32px rgba(31, 29, 26, 0.10)",
        modal: "0 24px 60px rgba(31, 29, 26, 0.16)",
      },
      maxWidth: {
        content: "1200px",
        "content-wide": "1280px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
