import { z } from 'zod';

export const IndexQuery = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});
export type IndexQuery = z.infer<typeof IndexQuery>;

export const CreateBody = z.object({
  version: z.coerce.number().positive(),

  // TODO: Can we do better? probably, but ¯\_(ツ)_/¯
  // Seriously though, we should probably use JSON as the type here.
  data: z.string(),
});
export type CreateBody = z.infer<typeof CreateBody>;
