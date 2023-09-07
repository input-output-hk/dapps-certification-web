module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: '#root',
  theme: {
    extend: {
      colors: {
        main: '#43425D',
        secondary: '#A6A7AD',
        active: '#3A87FF',
        inactive: '#EAEAEA',
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