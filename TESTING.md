# Testing Guide - Habit Tracker App

This document explains the testing setup and how to run tests for the habit tracker application.

## 🧪 Testing Framework

The project uses the following testing tools:

- **Jest** - JavaScript testing framework
- **React Native Testing Library** - React Native component testing utilities
- **React Test Renderer** - For rendering React components in tests

## 📁 Test Structure

```
__tests__/
├── components/          # Component tests
│   └── HabitCard.test.tsx
├── db/                  # Database operation tests
│   ├── habits.test.ts
│   └── completions.test.ts
├── store/               # Zustand store tests
│   └── habitStore.test.ts
├── utils/               # Utility function tests
│   ├── statsCalculator.test.ts
│   └── theme.test.ts
└── screens/             # Screen component tests (future)
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch mode)
npm run test:ci
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test -- HabitCard.test.tsx

# Run tests for a specific directory
npm test -- __tests__/db/

# Run tests matching a pattern
npm test -- --testNamePattern="should calculate stats"
```

## 📊 Test Coverage

The project has coverage thresholds set in `jest.config.js`:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## 🧩 Test Categories

### 1. Database Tests (`__tests__/db/`)

Tests for SQLite database operations:

- **habits.test.ts** - Habit CRUD operations
- **completions.test.ts** - Completion tracking and streak calculations

**Key test scenarios:**

- Insert, update, delete habits
- Mark habits as completed/uncompleted
- Calculate streaks and statistics
- Handle database errors gracefully

### 2. Store Tests (`__tests__/store/`)

Tests for Zustand state management:

- **habitStore.test.ts** - Habit store operations and state updates

**Key test scenarios:**

- Load habits from database
- Toggle habit completion
- Add, update, delete habits
- Handle loading and error states

### 3. Component Tests (`__tests__/components/`)

Tests for React Native components:

- **HabitCard.test.tsx** - Habit card component behavior

**Key test scenarios:**

- Render habit information correctly
- Handle user interactions (tap, long press)
- Display different goal types (binary, count, time)
- Show completion status and progress

### 4. Utility Tests (`__tests__/utils/`)

Tests for utility functions:

- **statsCalculator.test.ts** - Statistics calculation functions
- **theme.test.ts** - Theme color utilities

**Key test scenarios:**

- Calculate habit statistics correctly
- Handle edge cases (empty data, errors)
- Return consistent theme colors
- Validate color format and contrast

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@expo|expo|@unimodules|unimodules|sentry-expo|native-base|react-native-vector-icons|react-native-svg|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-reanimated|@react-native-community|@react-native-async-storage|expo-sqlite|expo-notifications|expo-sharing|expo-status-bar|react-native-modal-datetime-picker|react-native-svg|@expo/vector-icons)/)',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/screens/(.*)$': '<rootDir>/screens/$1',
    '^@/store/(.*)$': '<rootDir>/store/$1',
    '^@/db/(.*)$': '<rootDir>/db/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/android/**',
    '!**/ios/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/index.ts',
    '!**/App.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  verbose: true,
};
```

### Test Setup (`jest.setup.js`)

The setup file includes:

- Mock implementations for Expo modules
- Database mocking
- Navigation mocking
- Console output suppression

## 📝 Writing Tests

### Test File Naming

- Test files should end with `.test.ts` or `.test.tsx`
- Place tests in the `__tests__/` directory
- Mirror the source code structure

### Test Structure

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', () => {
    // Test implementation
  });

  it('should handle error cases', () => {
    // Error handling test
  });
});
```

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component/function does, not how it does it

2. **Use Descriptive Test Names**
   - `should calculate streak correctly` vs `should work`

3. **Test Edge Cases**
   - Empty data, null values, error conditions

4. **Mock External Dependencies**
   - Database calls, API requests, navigation

5. **Keep Tests Simple**
   - One assertion per test when possible

## 🐛 Debugging Tests

### Common Issues

1. **Module Resolution Errors**
   - Check `jest.config.js` transformIgnorePatterns
   - Ensure all dependencies are properly mocked

2. **Async Test Failures**
   - Use `await` for async operations
   - Wrap in `act()` for React state updates

3. **Mock Not Working**
   - Verify mock is placed before imports
   - Check mock implementation matches expected interface

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debug output
npm test -- --detectOpenHandles

# Run a specific test file with debug
npm test -- --testNamePattern="HabitCard" --verbose
```

## 🔄 Continuous Integration

Tests are configured to run in CI/CD pipelines:

```bash
# CI command
npm run test:ci
```

This command:

- Runs tests without watch mode
- Generates coverage reports
- Fails if coverage thresholds are not met
- Exits with appropriate status codes

## 📈 Coverage Reports

Coverage reports are generated in HTML format in the `coverage/` directory:

- Open `coverage/lcov-report/index.html` in a browser
- View line-by-line coverage details
- Identify untested code paths

## 🎯 Future Testing Improvements

1. **Integration Tests**
   - Test complete user workflows
   - Database integration tests

2. **E2E Tests**
   - End-to-end user scenarios
   - Cross-platform testing

3. **Performance Tests**
   - Database query performance
   - Component render performance

4. **Accessibility Tests**
   - Screen reader compatibility
   - Keyboard navigation

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)

---

**Last Updated**: January 2025  
**Test Coverage**: 70% threshold  
**Test Framework**: Jest + React Native Testing Library
