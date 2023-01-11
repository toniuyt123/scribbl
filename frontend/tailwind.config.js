/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./dist/*.html'],
  content: ["src/**/*.{html,js}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%": { transform: "rotateZ(3deg)" },
          "2%": { transform: "rotateZ(12deg)" },
          "4%": { transform: "rotateZ(-8deg)" },
          "6%": { transform: "rotateZ(8deg)" },
          "8%": { transform: "rotateZ(-4deg)" },
          "10%": { transform: "rotateZ(4deg)" },

          "33%": { transform: "rotateZ(-3deg)" },
          "56%": { transform: "rotateZ(3deg)" },
          "79%": { transform: "rotateZ(-3deg)" },
          "100%": { transform: "rotateZ(3deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
