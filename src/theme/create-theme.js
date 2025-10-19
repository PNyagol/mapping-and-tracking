import { createTheme as createMuiTheme } from '@mui/material/styles';

import { shadows } from './core/shadows.js';
import { palette } from './core/palette.js';
import { themeConfig } from './theme-config.js';
import { typography } from './core/typography.js';
import { components } from './core/components.jsx';
import { customShadows } from './core/custom-shadows.js';

// ----------------------------------------------------------------------

export const baseTheme = {
  colorSchemes: {
    light: {
      palette: palette.light,
      shadows: shadows.light,
      customShadows: customShadows.light,
    },
  },
  components,
  typography,
  shape: { borderRadius: 8 },
  cssVariables: themeConfig.cssVariables,
};

// ----------------------------------------------------------------------

export function createTheme({ themeOverrides = {} } = {}) {
  const theme = createMuiTheme(baseTheme, themeOverrides);
  return theme;
}
