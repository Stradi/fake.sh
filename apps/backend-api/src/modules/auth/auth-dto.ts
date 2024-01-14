import { z } from 'zod';

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
export type LoginBody = z.infer<typeof LoginBody>;

export const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
export type RegisterBody = z.infer<typeof RegisterBody>;

export const RefreshTokenBody = z.object({
  refresh_token: z.string(),
});
export type RefreshTokenBody = z.infer<typeof RefreshTokenBody>;
