import Constants from 'expo-constants';

/**
 * Environment detection utilities
 */

/**
 * Returns true if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return __DEV__ === true;
};

/**
 * Returns true if the app is running in production mode
 */
export const isProduction = (): boolean => {
  return __DEV__ === false;
};

/**
 * Returns true if the app is running in Expo Go
 */
export const isExpoGo = (): boolean => {
  // Expo Go has expo-specific config
  return Constants.expoGoConfig !== null;
};

/**
 * Returns true if the app is running in a development build
 */
export const isDevelopmentBuild = (): boolean => {
  // Development build is standalone but in development mode
  return Constants.executionEnvironment === 'standalone' && __DEV__ === true;
};

/**
 * Returns true if the app is running in a production build
 */
export const isProductionBuild = (): boolean => {
  // Production build is standalone but not in development mode
  return Constants.executionEnvironment === 'standalone' && __DEV__ === false;
};

/**
 * Returns the current environment string
 */
export const getEnvironment = (): string => {
  if (isExpoGo()) return 'expo-go';
  if (isDevelopmentBuild()) return 'development-build';
  if (isProductionBuild()) return 'production-build';
  return 'unknown';
};

/**
 * Returns true if debug features should be shown
 */
export const shouldShowDebugFeatures = (): boolean => {
  // Show debug features in ANY non-production environment
  // This includes: Expo Go, development builds, testing, etc.
  return !isProductionBuild();
};
