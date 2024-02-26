module.exports = {
    moduleNameMapper: {
      "@emurgo/cardano-serialization-lib-browser": "<rootDir>/src/mocks/serializerMock.js",
      "\\.(scss|sass|css)$": "identity-obj-proxy",
      "^api/(.*)$": "<rootDir>/src/api/$1",
      "^app/(.*)$": "<rootDir>/src/app/$1",
      "^assets/(.*)$": "<rootDir>/src/assets/$1",
      "^components/(.*)$": "<rootDir>/src/components/$1",
      "^compositions/(.*)$": "<rootDir>/src/compositions/$1",
      "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
      "^mocks/(.*)$": "<rootDir>/src/mocks/$1",
      "^pages/(.*)$": "<rootDir>/src/pages/$1",
      "^store/(.*)$": "<rootDir>/src/store/$1",
      "^utils/(.*)$": "<rootDir>/src/utils/$1",
    },
    collectCoverageFrom: ["src/**/*.tsx"],
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
      customExportConditions: [''],
    },
    transform: {
      "^src/.+\\.tsx?$": "ts-jest",
    },
    setupFiles: ['./jest.polyfills.js'],
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]],
  };