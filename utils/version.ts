/**
 * Utility to get the current app version.
 * This reads from package.json to get the version dynamically.
 */

/**
 * Get the current app version from package.json
 * @returns The current app version string
 */
export const getAppVersion = (): string => {
  try {
    // Try to import package.json dynamically
    const packageJson = require('../package.json');
    return packageJson.version || '1.0.0';
  } catch (error) {
    console.warn('Could not read package.json version, using fallback:', error);
    // Fallback to a default version if package.json can't be read
    return '1.0.0';
  }
};

/**
 * Get the current app version with build info
 * @returns The current app version with build information
 */
export const getAppVersionWithBuild = (): string => {
  const version = getAppVersion();
  // You could add build number here if needed
  return version;
};
