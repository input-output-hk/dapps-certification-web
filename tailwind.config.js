/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ffffff",
        },
        secondary: {
          DEFAULT: "#43425d",
        },
        green: {
          DEFAULT: "#67b537",
        },
        blue: {
          DEFAULT: "#3b86ff",
        },
        red: {
          DEFAULT: "#d54848",
        },
        gray: {
          input: "#cecfd0",
          inputBackground: "#f8f8f8",
          label: "#808495",
          title: "#5e5d75"
        },
        slate: {
          contentBackground: "#f0f0f7",
          table: {
            head: "#f5f6fa",
            headText: "#b0b3bf",
          }
        }
      },
      borderRadius: {
        3: "3px",
      },
      padding: {
        22: "22px"
      }
    },
  },
  plugins: [],
};