/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        appear: {
          "0%, 20%, 50%, 80%, 100%": { opacity: 0 },
          "40%": { opacity: 1 },
        },
      },
      animation: {
        "appear-delay1": "appear 1.4s infinite 0.2s",
        "appear-delay2": "appear 1.4s infinite 0.4s",
        "appear-delay3": "appear 1.4s infinite 0.6s",
      },
      fontFamily: {
        "wildy-sans": ["Wildy Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
