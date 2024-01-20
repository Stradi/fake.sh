import { createRef, type PropsWithChildren } from 'react';
import NavigationBar from './_components/navigation-bar';
import AccountPopover from './_components/navigation-bar/account-popover';
import TopNavigation from './_components/navigation-bar/top-navigation';

type Props = PropsWithChildren;

export default function Layout({ children }: Props) {
  return (
    <section>
      <header>
        <TopNavigation
          rightSide={<AccountPopover />}
          subText="Current Project"
        />
        <NavigationBar
          items={[
            {
              label: 'Overview',
              href: '/dashboard',
              ref: createRef<HTMLAnchorElement>(),
            },
            {
              label: 'Versions',
              href: '/dashboard/versions',
              ref: createRef<HTMLAnchorElement>(),
            },
            {
              label: 'Settings',
              href: '/dashboard/groups',
              ref: createRef<HTMLAnchorElement>(),
            },
          ]}
        />
      </header>
      <main>{children}</main>
    </section>
  );
}
