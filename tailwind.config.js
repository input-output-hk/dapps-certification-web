module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: '#root',
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        main: '#43425D',
        mainDark: '#3C3B53',
        mainLight: '#A5A4BF',
        mainActive: '#A3A0FB',
        secondary: '#A6A7AD',
        active: '#3A87FF',
        inactive: '#EAEAEA',
        app: '#F0F0F7',
        text: '#4E4F5C',
        tableHeader: '#F5F6FA',
        tableHeaderText: '#A3A6B4',
        active: '#0ea5e9',
        activeDark: '#0284c7',
        inactive: '#EAEAEA',
        app: '#F0F0F7',
        text: '#4E4F5C',
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