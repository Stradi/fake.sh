import { z } from 'zod';

export const IndexQuery = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});
export type IndexQuery = z.infer<typeof IndexQuery>;

export const UpdateBody = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});
export type UpdateBody = z.infer<typeof UpdateBody>;
