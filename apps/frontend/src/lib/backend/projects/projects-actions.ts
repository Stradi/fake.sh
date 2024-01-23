'use server';

import { revalidatePath } from 'next/cache';
import type { ApiProject } from '../backend-types';
import createServerActionClient from '../client/create-server-action-client';
import type { CreateProjectFormType } from './projects-types';

export async function createProject(
  revalidatePaths: string[],
  payload: CreateProjectFormType
) {
  const client = await createServerActionClient();
  const response = await client.sendRequest<{
    message: string;
    payload: ApiProject;
  }>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  for (const path of revalidatePaths) {
    revalidatePath(path);
  }

  return response;
}
