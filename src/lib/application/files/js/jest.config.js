/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'json'],
  rootDir: 'src',
  testRegex: '.<%= specFileSuffix %>.js$',
  coverageDirectory: '../coverage',
};

module.exports = config;
