import { z } from 'zod';

export const IndexQuery = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
  with_schemas: z.coerce.boolean().optional(),
  with_owner: z.coerce.boolean().optional(),
  with_usage: z.coerce.boolean().optional(),
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'millennium']).optional(),
  own: z.coerce.boolean().optional(),
});
export type IndexQuery = z.infer<typeof IndexQuery>;

export const ShowQuery = z.object({
  with_schemas: z.coerce.boolean().optional(),
  with_owner: z.coerce.boolean().optional(),
  with_usage: z.coerce.boolean().optional(),
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'millennium']).optional(),
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

export const GetUsageQuery = z.object({
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'millennium']),
});
export type GetUsageQuery = z.infer<typeof GetUsageQuery>;
