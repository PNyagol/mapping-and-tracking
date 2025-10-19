import { Iconify } from 'src/components/iconify';
import { SvgColor } from '../components/svg-color'

// ----------------------------------------------------------------------
const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export const _account = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Iconify icon="ix:dashboard-filled" width={22}/>,
  },
  {
    label: 'Account',
    href: '/user/account',
    icon: icon('ic-user'),
  },
  {
    label: 'Analytics',
    href: '/user/analytics',
    icon: icon('ic-analytics'),
  },
];
