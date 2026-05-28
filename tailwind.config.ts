import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070d",
        panel: "#0a111f",
        line: "#1d2a3f",
        honey: {
          100: "#fff3c4",
          200: "#f8d46c",
          300: "#e6ab2a",
          400: "#c88b18",
        },
        signal: "#45d3ff",
        verified: "#5ee39b",
        critical: "#ff7a45",
      },
      boxShadow: {
        glow: "0 0 40px rgba(69, 211, 255, 0.18)",
        honey: "0 0 42px rgba(230, 171, 42, 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        pulseNode: { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
        edgeFlow: { from: { strokeDashoffset: "32" }, to: { strokeDashoffset: "0" } },
        drift: { from: { transform: "translate3d(0,0,0)" }, to: { transform: "translate3d(28px,18px,0)" } },
      },
      animation: {
        pulseNode: "pulseNode 2.6s ease-in-out infinite",
        drift: "drift 16s linear infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
