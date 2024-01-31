import Container from '@components/container';
import type { ApiProject } from '@lib/backend/backend-types';
import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import { notFound } from 'next/navigation';
import Header from '../../../_components/header';
import DeleteAllVersionsButton from './_components/delete-all-versions-button';
import DeleteProjectButton from './_components/delete-project-button';
import ReactiveSaveButton from './_components/reactive-save-button';
import UpdateSettingsForm from './_components/update-settings-form';

type Props = {
  params: {
    projectSlug: string;
  };
};

export default async function Page({ params: { projectSlug } }: Props) {
  const backendClient = await createServerComponentClient();
  const project = await backendClient.sendRequest<{
    message: string;
    payload: ApiProject;
  }>(`/api/v1/projects/${projectSlug}`);

  if (!project.success) {
    return notFound();
  }

  return (
    <div>
      <Header description="Manage your project settings" title="Settings">
        <ReactiveSaveButton project={project.data.payload} />
      </Header>
      <hr />
      <br />
      <Container className="space-y-6">
        <UpdateSettingsForm project={project.data.payload} />
        <hr />
        <div className="-m-2 space-y-4 rounded-md border border-red-400 p-2">
          <DeleteProjectButton project={project.data.payload} />
          <DeleteAllVersionsButton project={project.data.payload} />
        </div>
      </Container>
    </div>
  );
}
