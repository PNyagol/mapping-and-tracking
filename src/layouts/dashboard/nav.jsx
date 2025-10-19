import { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import { NavUpgrade } from '../components/nav-upgrade';
import { WorkspacesPopover } from '../components/workspaces-popover';

// ---------------------- NavDesktop ----------------------

export function NavDesktop({ sx, data, slots, workspaces, layoutQuery }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

// ---------------------- NavMobile ----------------------

export function NavMobile({ sx, data, open, slots, onClose, workspaces }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ---------------------- NavContent ----------------------

export function NavContent({ data, slots, workspaces, sx }) {
  const pathname = usePathname();

  return (
    <>
      <Logo />

      {slots?.topArea}

      {/* <WorkspacesPopover data={workspaces} sx={{ my: 2 }} /> */}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
              marginTop: '40px'
            }}
          >
            {data.map((navItem) => (
              <>
                <Typography style={{ color: 'rgb(33, 43, 54)', textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', marginBottom: '10px' }} variant='body'>{navItem.title}</Typography>
                {navItem.modules.map((item, index) => (
                  <ListItem disableGutters disablePadding key={item.index}>
                    <ListItemButton
                      disableGutters
                      component={RouterLink}
                      href={item.path}
                      sx={[
                        (theme) => ({
                          pl: 2,
                          py: 1,
                          gap: 2,
                          pr: 1.5,
                          borderRadius: 0.75,
                          typography: 'body2',
                          fontWeight: 'fontWeightMedium',
                          color: theme.vars.palette.text.secondary,
                          minHeight: 44,
                          ...(item.path === pathname && {
                            fontWeight: 'fontWeightSemiBold',
                            color: theme.vars.palette.primary.main,
                            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                            '&:hover': {
                              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                            },
                          }),
                        }),
                      ]}
                    >
                      <Box component="span" sx={{ width: 24, height: 24 }}>
                        {item.icon}
                      </Box>

                      <Box component="span" sx={{ flexGrow: 1 }}>
                        {item.title}
                      </Box>

                      {item.info && item.info}
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            ))}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
