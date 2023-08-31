module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  roots: ["<rootDir>/src/", "<rootDir>/test/"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  coverageDirectory: "./coverage/",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!**/node_modules/**",
    "!src/main.ts"
  ],
  collectCoverage: true,
  reporters: ["default", "jest-sonar"],
  coverageReporters: ["text", "lcov", "json", "text", "clover", "cobertura"],
  globals: {
    "ts-jest": {
      diagnostics: true,
      warnOnly: true,
      ignoreCodes: [
        18002 // The ‘files’ list in config file is empty. (it is strongly recommended to include this one)
      ],
      pretty: true
    }
  }
};
