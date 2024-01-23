import { z } from 'zod';
import type { ApiProject } from '../backend-types';
import type { ApiResponse } from '../client';

export const CreateProjectFormSchema = z.object({
  name: z.string().min(3),
});

export type CreateProjectFormType = z.infer<typeof CreateProjectFormSchema>;
export type CreateProjectApiFn = (data: CreateProjectFormType) => Promise<
  ApiResponse<{
    message: string;
    payload: ApiProject;
  }>
>;
