import { z } from 'zod';

export const IndexQuery = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});
export type IndexQuery = z.infer<typeof IndexQuery>;

export const CreateBody = z.object({
  name: z.string().min(3).max(63),
});
export type CreateBody = z.infer<typeof CreateBody>;

export const UpdateBody = z.object({
  name: z.string().min(3).max(63).optional(),
  slug: z.string().min(3).max(63).optional(),
});
export type UpdateBody = z.infer<typeof UpdateBody>;
