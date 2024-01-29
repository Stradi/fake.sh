'use client';

import useCurrentProject from '@hooks/use-current-project';
import NavigationBar from '../../_components/navigation-bar';

export default function NavigationBarRenderer() {
  const projectSlug = useCurrentProject();

  return (
    <NavigationBar
      items={[
        {
          label: 'Overview',
          href: `/dashboard/${projectSlug}`,
          ref: { current: null },
        },
        {
          label: 'Versions',
          href: `/dashboard/${projectSlug}/versions`,
          ref: { current: null },
        },
        {
          label: 'Settings',
          href: `/dashboard/settings`,
          ref: { current: null },
        },
      ]}
    />
  );
}
