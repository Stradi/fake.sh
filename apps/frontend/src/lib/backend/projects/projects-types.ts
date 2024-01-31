import { z } from 'zod';
import type { ApiProject, ApiSchema } from '../backend-types';
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

export const UpdateProjectFormSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
});

export type UpdateProjectFormType = z.infer<typeof UpdateProjectFormSchema>;
export type UpdateProjectApiFn = (
  projectId: string,
  data: UpdateProjectFormType
) => Promise<
  ApiResponse<{
    message: string;
    payload: ApiProject;
  }>
>;

export type DeleteProjectApiFn = (projectId: string) => Promise<
  ApiResponse<{
    message: string;
    payload: ApiProject;
  }>
>;

export type DeleteAllVersionsApiFn = (projectId: string) => Promise<
  ApiResponse<{
    message: string;
    payload: ApiSchema[];
  }>
>;
