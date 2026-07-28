import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/src/__tests__/jest.setup.ts"],
  moduleNameMapper: {
    "^otplib$": "<rootDir>/src/__tests__/__mocks__/otplib.ts",
    "^qrcode$": "<rootDir>/src/__tests__/__mocks__/qrcode.ts",
  },
};

export default config;
