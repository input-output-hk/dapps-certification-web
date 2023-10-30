module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ffffff"
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
          background: "#f2dede",
          title: "#a94442"
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
          table: {
            head: "#f5f6fa",
            headText: "#b0b3bf",
          },
          main: "#43425D",
          mainDark: '#3C3B53',
          textLight: '#A5A4BF',
          highlighted: '#A3A0FB',
          highlightedDark: '#7e7dc4',
          app: '#F0F0F7',
          text: '#4E4F5C'
        },
        transparent: 'transparent',
        tableHeader: '#F5F6FA',
        tableHeaderText: '#A3A6B4',
        bodyTextGray: '#878e9e',
        darkBgTextColor: '#f2dede',
        lightRed: '#f2dede',
        darkRed: '#a94442',
        darkGray: '#5a5a5a',
        lighterGreen: '#dff0d8',
        lightGreen: '#e2eee2',
      },
      backgroundImage: {
        landing: 'url(assets/images/landing-background.png)',
      },
      borderRadius: {
        3: "3px",
      },
      padding: {
        20: "20px",
        22: "22px"
      },
      margin: {
        5: "5px",
        10: "10px",
        20: "20px"
      },
      screens: {
        tab: "1200px", // => @media (min-width: 1280px) { ... }
        xs: "375px" // => @media (min-width: 375px) { ... }
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: []
};