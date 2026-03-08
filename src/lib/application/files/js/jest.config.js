/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'json'],
  rootDir: 'src',
  testRegex: '.spec.js$',
  coverageDirectory: '../coverage',
};

module.exports = config;
