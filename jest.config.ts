import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  testRegex: "\.test(\.server)?\.ts",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  preset: "ts-jest",
  testEnvironment: "node"
};
export default config;
