import Container from '@components/container';
import type { ApiProject } from '@lib/backend/backend-types';
import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import Header from '../../../_components/header';
import SideNavigation from '../../../_components/side-navigation';

type Props = PropsWithChildren & {
  params: {
    projectSlug: string;
  };
};

export default async function Layout({
  children,
  params: { projectSlug },
}: Props) {
  const backendClient = await createServerComponentClient();
  const project = await backendClient.sendRequest<{
    message: string;
    payload: ApiProject;
  }>(`/api/v1/projects/${projectSlug}?with_schemas=1`);

  if (!project.success) {
    return notFound();
  }

  return (
    <div>
      <Header
        description={`A general overview of your project, ${project.data.payload.name}`}
        title="Overview"
      />
      <hr />
      <br />
      <Container className="flex gap-4">
        <SideNavigation
          className="w-60"
          items={[
            {
              label: 'Overview',
              href: `/dashboard/${projectSlug}`,
            },
            {
              label: 'Settings',
              href: `/dashboard/${projectSlug}/settings`,
            },
          ]}
        />
        <div className="grow">{children}</div>
      </Container>
    </div>
  );
}
