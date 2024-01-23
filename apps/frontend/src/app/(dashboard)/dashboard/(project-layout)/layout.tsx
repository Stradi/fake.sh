import type { PropsWithChildren } from 'react';
import AccountPopover from '../_components/navigation-bar/account-popover';
import TopNavigation from '../_components/navigation-bar/top-navigation';
import NavigationBarRenderer from './_components/navigation-bar-renderer';

type Props = PropsWithChildren;

export default function Layout({ children }: Props) {
  return (
    <section>
      <header>
        <TopNavigation rightSide={<AccountPopover />} subText="Test Project" />
        {/*
          We need this NavigationBarRenderer because the links in navbar are not static and depends on the current project.
          We are getting the current project from the URL. So we need to render the navbar in client side. At first glance,
          this looks too error prone but it's not. This layout only renders when we navigate /dashboard/:projectSlug. Which
          means projectSlug is always available in the URL. So we can safely render the navigation bar in client using URL.
        */}
        <NavigationBarRenderer />
      </header>
      <main>{children}</main>
    </section>
  );
}
