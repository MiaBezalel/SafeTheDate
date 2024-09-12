/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  noSchemaStitching: true,
  testPathIgnorePatterns: [
    "/node_modules/",
    "./dist"
  ],
  coverageReporters: [
    "lcov",
    "html"
  ],
  reporters: [
    "default",
    ["jest-html-reporters", {
      "publicPath": "./html-report",
      "filename": "report.html",
      "openReport": true
    }]
  ],
};