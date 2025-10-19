import { useId } from 'react';
import { mergeClasses } from 'minimal-shared/utils';
import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';
import { RouterLink } from 'src/routes/components';
import { logoClasses } from './classes.js';
import LOGO_IMAGES from '@/assets/logo.svg'

// ----------------------------------------------------------------------

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}) {
  const theme = useTheme();
  const gradientId = useId();

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARKER = theme.vars.palette.primary.dark;

  const singleLogo = (
    <div>
      <img src={LOGO_IMAGES} alt='Logo' />
    </div>
  );


const fullLogo = (
  <img src={LOGO_IMAGES} alt='Logo' />
);


  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 150,
          height: 100,
          ...(!isSingle && { width: 102, height: 70 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
