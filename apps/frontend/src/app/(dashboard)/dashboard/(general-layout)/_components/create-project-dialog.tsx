'use client';

import ScalingDialogRoot from '@components/scaling-dialog';
import { Button } from '@components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
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
import type { CreateProjectFormType } from '@lib/backend/projects/projects-types';
import { CreateProjectFormSchema } from '@lib/backend/projects/projects-types';
import useProjectsApi from '@lib/backend/projects/use-projects-api';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function CreateProjectDialog() {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const api = useProjectsApi();
  const form = useForm<CreateProjectFormType>({
    resolver: zodResolver(CreateProjectFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(data: CreateProjectFormType) {
    // @ts-expect-error -- react@beta supports async functions in startTransition
    startTransition(async () => {
      const response = await api.createProject(data);
      if (!response.success) {
        form.setError('root', {
          message: response.error.message,
        });
        toast.error(response.error.message);
        return;
      }

      toast.success('Project created successfully');
      router.push(`/dashboard/${response.data.payload.slug}`);

      form.reset();
      setOpen(false);
    });
  }

  return (
    <ScalingDialogRoot
      onClose={() => {
        setOpen(false);
      }}
      onOpen={() => {
        setOpen(true);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button>Create Project</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project and generate automatic API routes for it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- ...
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My New Project Name"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.root.message}
              </p>
            ) : null}
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </DialogContent>
    </ScalingDialogRoot>
  );
}
