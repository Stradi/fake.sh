'use client';

import NavigationBar from '../../_components/navigation-bar';

export default function NavigationBarRenderer() {
  // TODO: Get project slug from URL, we should probably use a hook
  // that returns ApiProject using URL.
  const projectSlugFromUrl = 'test';

  return (
    <NavigationBar
      items={[
        {
          label: 'Overview',
          href: `/dashboard/${projectSlugFromUrl}`,
          ref: { current: null },
        },
        {
          label: 'Versions',
          href: `/dashboard/${projectSlugFromUrl}/versions`,
          ref: { current: null },
        },
        {
          label: 'Usage',
          href: `/dashboard/${projectSlugFromUrl}/usage`,
          ref: { current: null },
        },
      ]}
    />
  );
}
