/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        rosegold: {
          50: "#FDF4F5",
          100: "#FBE7E9",
          200: "#F5CED3",
          300: "#EDB1B8",
          400: "#E8B4B8",
          500: "#D98A93",
          600: "#C2646F",
          700: "#A24D58",
          800: "#86414A",
          900: "#713B42",
        },
        project: {
          hyaluronic: "#A855F7",
          photoelectric: "#3B82F6",
          skincare: "#10B981",
          surgery: "#F97316",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          critical: "#EF4444",
          info: "#3B82F6",
        },
        dark: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
        display: ['"Noto Sans SC"', '"PingFang SC"', "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        "gradient-kpi1": "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.05) 100%)",
        "gradient-kpi2": "linear-gradient(135deg, rgba(232,180,184,0.2) 0%, rgba(217,138,147,0.05) 100%)",
        "gradient-kpi3": "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.05) 100%)",
        "gradient-kpi4": "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.05) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-critical": "0 0 20px rgba(239, 68, 68, 0.3)",
        "glow-warning": "0 0 15px rgba(245, 158, 11, 0.25)",
        "glow-success": "0 0 15px rgba(16, 185, 129, 0.25)",
        card: "0 4px 24px rgba(0, 0, 0, 0.12)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.18)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "count-up": "countUp 0.8s ease-out",
        "wave": "wave 1.5s ease-in-out infinite",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};
