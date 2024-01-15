import { z } from 'zod';

export const IndexQuery = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
  with_project: z.coerce.boolean().optional(),
  with_owner: z.coerce.boolean().optional(),
});
export type IndexQuery = z.infer<typeof IndexQuery>;

export const ShowQuery = z.object({
  with_project: z.coerce.boolean().optional(),
  with_owner: z.coerce.boolean().optional(),
});
export type ShowQuery = z.infer<typeof ShowQuery>;

export const CreateBody = z.object({
  version: z.coerce.number().positive(),

  // TODO: Can we do better? probably, but ¯\_(ツ)_/¯
  // Seriously though, we should probably use JSON as the type here.
  data: z.string(),
});
export type CreateBody = z.infer<typeof CreateBody>;

export const UpdateBody = z.object({
  version: z.coerce.number().positive(),
  data: z.string(),
});
export type UpdateBody = z.infer<typeof UpdateBody>;
