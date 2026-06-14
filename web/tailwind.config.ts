import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

/**
 * NetworkNinjas design tokens.
 *
 * Aesthetic: "midnight dojo / terminal" — a deep ink canvas, warm paper text,
 * a single sharp katana-steel accent, and a sakura warm accent used sparingly.
 * The vibe is a high-end dev tool (Warp / Linear / Vercel dark) crossed with
 * the calm of a dojo. Colors are intentionally restrained: two accents, not a
 * rainbow.
 */
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canvas
        ink: {
          DEFAULT: "#0a0c10", // page background — near black with a cool tint
          raised: "#10141b", // cards / panels
          inset: "#070809", // terminals / code wells
          line: "#1d232e", // hairline borders
          glow: "#161c26", // hover wells
        },
        // Text
        paper: {
          DEFAULT: "#e8e6df", // primary text — warm off-white
          muted: "#9aa3af", // secondary
          faint: "#5d6675", // tertiary / captions
        },
        // Primary accent — katana steel (cool cyan-green)
        blade: {
          DEFAULT: "#4fe0c4",
          dim: "#2fa890",
          deep: "#0e2b27",
        },
        // Warm accent — sakura, used very sparingly for "challenge"/highlights
        sakura: {
          DEFAULT: "#ff7a8a",
          dim: "#c75463",
          deep: "#2c1418",
        },
        // Signal — amber for "planned / coming soon"
        ember: {
          DEFAULT: "#e9b872",
          deep: "#2a2114",
        },
      },
      fontFamily: {
        // Display: characterful grotesque (loaded via next/font in layout)
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        // Body: humanist sans for long-form reading
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        // Mono: the terminal voice
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        prose: "44rem",
        shell: "76rem",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 24px 60px -30px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(79,224,196,0.25), 0 12px 40px -16px rgba(79,224,196,0.25)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blade-sweep": {
          "0%": { transform: "translateX(-120%) skewX(-12deg)", opacity: "0" },
          "40%": { opacity: "0.9" },
          "100%": { transform: "translateX(220%) skewX(-12deg)", opacity: "0" },
        },
        pulse_dot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "blade-sweep": "blade-sweep 2.6s ease-in-out infinite",
        "pulse-dot": "pulse_dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
};

export default config;
