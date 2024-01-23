import type { ApiProject } from '@lib/backend/backend-types';
import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import type { PropsWithChildren } from 'react';
import AccountPopover from '../_components/navigation-bar/account-popover';
import TopNavigation from '../_components/navigation-bar/top-navigation';
import NavigationBarRenderer from './_components/navigation-bar-renderer';
import ProjectSelector from './_components/project-selector';

type Props = PropsWithChildren;

export default async function Layout({ children }: Props) {
  const backendClient = await createServerComponentClient();
  const projects = await backendClient.sendRequest<{
    message: string;
    payload: ApiProject[];
  }>('/api/v1/projects?own=1&limit=100');

  if (!projects.success) {
    throw new Error(projects.error.message);
  }

  return (
    <section>
      <header>
        <TopNavigation
          rightSide={<AccountPopover />}
          subText={<ProjectSelector projects={projects.data.payload} />}
        />
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
