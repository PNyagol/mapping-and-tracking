import { themeConfig } from './theme-config.js';

// ----------------------------------------------------------------------

export function createClasses(className) {
  return `${themeConfig.classesPrefix}__${className}`;
}
