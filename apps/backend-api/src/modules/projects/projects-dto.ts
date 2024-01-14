import { z } from 'zod';

export const IndexQuery = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
  with_schemas: z.coerce.boolean().optional(),
});
export type IndexQuery = z.infer<typeof IndexQuery>;

export const ShowQuery = z.object({
  with_schemas: z.coerce.boolean().optional(),
});
export type ShowQuery = z.infer<typeof ShowQuery>;

export const CreateBody = z.object({
  name: z.string().min(3).max(63),
});
export type CreateBody = z.infer<typeof CreateBody>;

export const UpdateBody = z.object({
  name: z.string().min(3).max(63).optional(),
  slug: z.string().min(3).max(63).optional(),
});
export type UpdateBody = z.infer<typeof UpdateBody>;
