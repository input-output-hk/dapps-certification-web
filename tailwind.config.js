module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: '#root',
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        main: '#43425D',
        mainDark: '#3C3B53',
        highlighted: '#A3A0FB',
        highlightedDark: '#7e7dc4',
        active: '#0ea5e9',
        activeDark: '#0284c7',
        secondary: '#A6A7AD',
        inactive: '#EAEAEA',
        app: '#F0F0F7',
        text: '#4E4F5C',
        textLight: '#A5A4BF',
        tableHeader: '#F5F6FA',
        tableHeaderText: '#A3A6B4',
      },
      backgroundImage: {
        landing: 'url(assets/images/landing-background.png)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};