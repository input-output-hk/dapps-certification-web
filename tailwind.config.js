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