import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export const navData = [
  {
    title: 'Dashboard',
    modules: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <Iconify icon="ix:dashboard-filled" width={22}/>,
      },
      {
        title: 'Pinned Location',
        path: '/location/reported',
        icon: <Iconify icon="akar-icons:check-in" width={22}/>,
      },
    ],
  },
  {
    title: 'Account',
    modules: [
      {
        title: 'Analytics',
        path: '/user/analytics',
        icon: icon('ic-analytics'),
      },
      {
        title: 'View Account',
        path: '/user/account',
        icon: icon('ic-user'),
      },
    ],
  }
];
