import { createRef, type PropsWithChildren } from 'react';
import NavigationBar from '../_components/navigation-bar';
import TopNavigation from '../_components/navigation-bar/top-navigation';

type Props = PropsWithChildren;

export default function Layout({ children }: Props) {
  return (
    <section>
      <header>
        <TopNavigation rightSide="Account Popover" />
        <NavigationBar
          items={[
            {
              label: 'Overview',
              href: '/dashboard',
              ref: createRef<HTMLAnchorElement>(),
            },
            {
              label: 'Settings',
              href: '/dashboard/settings',
              ref: createRef<HTMLAnchorElement>(),
            },
          ]}
        />
      </header>
      <main>{children}</main>
    </section>
  );
}
