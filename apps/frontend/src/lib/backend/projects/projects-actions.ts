'use server';

import { revalidatePath } from 'next/cache';
import type { ApiProject } from '../backend-types';
import createServerActionClient from '../client/create-server-action-client';
import type {
  CreateProjectFormType,
  UpdateProjectFormType,
} from './projects-types';

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

export async function updateProject(
  revalidatePaths: string[],
  projectId: string,
  payload: UpdateProjectFormType
) {
  const client = await createServerActionClient();
  const response = await client.sendRequest<{
    message: string;
    payload: ApiProject;
  }>(`/api/v1/projects/${projectId}`, {
    method: 'PUT',
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

export async function deleteProject(
  revalidatePaths: string[],
  projectId: string
) {
  const client = await createServerActionClient();
  const response = await client.sendRequest<{
    message: string;
    payload: ApiProject;
  }>(`/api/v1/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  for (const path of revalidatePaths) {
    revalidatePath(path);
  }

  return response;
}
