import { z } from 'zod';
import type { ApiSchema } from '../backend-types';
import type { ApiResponse } from '../client';

export const CreateSchemaFormSchema = z.object({
  version: z.number().positive(),
  data: z.record(
    z.object({
      initialCount: z.number(),
      columns: z.record(z.any()),
    })
  ),
});

export type CreateSchemaFormType = z.infer<typeof CreateSchemaFormSchema>;
export type CreateSchemaApiFn = (
  projectId: string,
  data: CreateSchemaFormType,
  revalidatePaths: string[]
) => Promise<
  ApiResponse<{
    message: string;
    payload: ApiSchema;
  }>
>;
