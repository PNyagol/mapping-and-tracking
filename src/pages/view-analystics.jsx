import { CONFIG } from 'src/config-global';
import { ViewAnalytics } from '../sections/vehicles/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`View Vehicles - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Your journey to confident driving starts here. Learn smart, drive safe, go anywhere."
      />
      <meta name="keywords" content="Learn smart, drive safe, go anywhere." />

      <ViewAnalytics />
    </>
  );
}
