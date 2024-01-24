import Container from '@components/container';
import type { ApiProject, ApiSchema } from '@lib/backend/backend-types';
import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import { notFound } from 'next/navigation';
import Header from '../../../_components/header';
import CreateVersionDialog from './_components/create-version-dialog';
import VersionsTable from './_components/versions-table';

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

  const schemas = await backendClient.sendRequest<{
    message: string;
    payload: ApiSchema[];
  }>(`/api/v1/projects/${project.data.payload.id}/schemas`);

  if (!schemas.success) {
    throw new Error(schemas.error.message);
  }

  return (
    <div>
      <Header
        description="Create, view, edit or delete versions of for your mock API"
        title="Versions"
      >
        <CreateVersionDialog
          previousVersion={
            schemas.data.payload[schemas.data.payload.length - 1]
          }
          project={project.data.payload}
        />
      </Header>
      <hr />
      <br />
      <Container>
        <VersionsTable versions={schemas.data.payload} />
      </Container>
    </div>
  );
}
