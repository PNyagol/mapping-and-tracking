import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Your journey to confident driving starts here. Learn smart, drive safe, go anywhere."
      />
      <meta name="keywords" content="Learn smart, drive safe, go anywhere." />

      <DashboardView />
    </>
  );
}
