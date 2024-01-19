'use client';

import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import useBackendClient from '@hooks/use-backend-client';
import { login } from '@lib/backend/auth';
import { cn } from '@utils/tw';
import type { ComponentPropsWithoutRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormType = z.infer<typeof LoginFormSchema>;
type Props = ComponentPropsWithoutRef<'form'>;

export default function LoginForm({ className, ...props }: Props) {
  const form = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const backendClient = useBackendClient();

  async function onSubmit(data: LoginFormType) {
    const obj = await login(backendClient, data);
    if (!obj.success) {
      form.setError('root', {
        message: obj.error.message,
      });
      return;
    }
    window.location.href = '/dashboard';
  }

  return (
    <Form {...form}>
      <form
        className={cn('flex flex-col gap-4', className)}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- ...
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jon@snow.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="jonsnow" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root ? (
          <p className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <Button type="submit">Login</Button>
      </form>
    </Form>
  );
}
