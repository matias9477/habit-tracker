/* eslint-disable @typescript-eslint/no-var-requires */

const custom = require('@digitalroute/cz-conventional-changelog-for-jira/configurable');

module.exports = custom({
  skipScope: false,
  maxHeaderWidth: 80,
  jiraPrefix: 'CON',
  skipDescription: true,
  scopes: [
    '',
    'habits',
    'completions',
    'stats',
    'onboarding',
    'notifications',
    'ui',
    'components',
    'screens',
    'navigation',
    'modals',
    'store',
    'db',
    'data',
    'theme',
    'utils',
    'config',
    'assets'
  ],
});
