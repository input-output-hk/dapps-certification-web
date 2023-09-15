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
          active: '#0ea5e9',
          activeDark: '#0284c7'
        },
        red: {
          DEFAULT: "#d54848",
        },
        gray: {
          input: "#cecfd0",
          inputBackground: "#f8f8f8",
          label: "#808495",
          title: "#5e5d75",
          secondary: "#A6A7AD",
          inactive: '#EAEAEA'
        },
        slate: {
          contentBackground: "#f0f0f7",
          table: {
            head: "#f5f6fa",
            headText: "#b0b3bf",
          },
          main: "#43425D",
          mainDark: '#3C3B53',
          mainLight: '#A5A4BF',
          mainActive: '#A3A0FB',
          app: '#F0F0F7',
          text: '#4E4F5C'
        },
        transparent: 'transparent'
        tableHeader: '#F5F6FA',
        tableHeaderText: '#A3A6B4',
      },
      backgroundImage: {
        landing: 'url(assets/images/landing-background.png)',
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