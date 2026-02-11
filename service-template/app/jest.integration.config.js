/** @type {import('jest').Config} */
module.exports = {
  ...require("./jest.config"),
  testMatch: ["**/tests/**/*.integration.test.ts"],
  testTimeout: 30000,
};
