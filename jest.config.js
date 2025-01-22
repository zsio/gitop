module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
}; 