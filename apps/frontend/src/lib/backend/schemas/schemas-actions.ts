'use server';

import { revalidatePath } from 'next/cache';
import type { ApiSchema } from '../backend-types';
import createServerActionClient from '../client/create-server-action-client';
import type { CreateSchemaFormType } from './schemas-types';

export async function createSchema(
  projectId: string,
  payload: CreateSchemaFormType,
  revalidatePaths: string[]
) {
  const client = await createServerActionClient();
  const response = await client.sendRequest<{
    message: string;
    payload: ApiSchema;
  }>(`/api/v1/projects/${projectId}/schemas`, {
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

export async function deleteSchema(
  projectId: string,
  schemaId: string,
  revalidatePaths: string[]
) {
  const client = await createServerActionClient();
  const response = await client.sendRequest<{
    message: string;
    payload: ApiSchema;
  }>(`/api/v1/projects/${projectId}/schemas/${schemaId}`, {
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
