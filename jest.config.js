{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/src/",
    "<rootDir>/tests/"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts"
  ],
  "moduleNameMapper": {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@cli/(.*)$": "<rootDir>/src/cli/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@parsers/(.*)$": "<rootDir>/src/parsers/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1"
  }
}