import Container from '@components/container';
import type { ApiProject } from '@lib/backend/backend-types';
import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import Header from '../_components/header';
import CreateProjectDialog from './_components/create-project-dialog';

export default async function Page() {
  const backendClient = await createServerComponentClient();
  const projects = await backendClient.sendRequest<{
    message: string;
    payload: ApiProject[];
  }>('/api/v1/projects?own=1&limit=100');

  if (!projects.success) {
    throw new Error('Failed to fetch projects');
  }

  return (
    <div>
      <Header title="My Projects">
        <CreateProjectDialog />
      </Header>
      <hr />
      <br />
      <Container>
        {projects.data.payload.toReversed().map((project) => (
          <p key={project.id}>{project.name}</p>
        ))}
      </Container>
    </div>
  );
}
