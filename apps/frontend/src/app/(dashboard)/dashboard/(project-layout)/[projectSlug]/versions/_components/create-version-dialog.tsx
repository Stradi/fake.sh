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
import { Form } from '@components/ui/form';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ApiProject, ApiSchema } from '@lib/backend/backend-types';
import { CreateSchemaFormSchema } from '@lib/backend/schemas/schemas-types';
import useSchemasApi from '@lib/backend/schemas/use-schemas-api';
import { startTransition, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodeMirrorEditor from './code-mirror-editor';

type Props = {
  project: ApiProject;
  previousVersion?: ApiSchema;
};

const CreateVersionFormSchema = z.object({
  rawJson: z.string(),
});

type CreateVersionFormType = z.infer<typeof CreateVersionFormSchema>;

// TODO: This is a mess, clean it up
export default function CreateVersionDialog({
  project,
  previousVersion,
}: Props) {
  const api = useSchemasApi();
  const [open, setOpen] = useState(false);

  const getDefaultValue = useCallback(() => {
    if (!previousVersion) {
      return `{
  "version": 1,
  "data": {
    <CURSOR>
  }
}`;
    }

    const version = previousVersion.version + 1;
    const data = previousVersion.data;

    return JSON.stringify({ version, data }, null, 2);
  }, [previousVersion]);

  const defaultCursorPos = !getDefaultValue().includes('<CURSOR>')
    ? 0
    : getDefaultValue().indexOf('<CURSOR>');

  const form = useForm<CreateVersionFormType>({
    resolver: zodResolver(CreateVersionFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      rawJson: getDefaultValue(),
    },
  });

  function onSubmit(formData: CreateVersionFormType) {
    try {
      JSON.parse(formData.rawJson);
    } catch {
      form.setError('root', {
        message: 'Invalid JSON',
      });
      return;
    }

    const { success: isValid } = CreateSchemaFormSchema.safeParse(
      JSON.parse(formData.rawJson)
    );

    if (!isValid) {
      form.setError('root', {
        message: 'JSON does not match schema',
      });
      return;
    }

    form.clearErrors('root');

    const validatedData = CreateSchemaFormSchema.parse(
      JSON.parse(formData.rawJson)
    );

    // @ts-expect-error -- react@beta supports async functions in startTransition
    startTransition(async () => {
      const response = await api.createSchema(
        project.id,
        {
          version: validatedData.version,
          data: validatedData.data,
        },
        [`/dashboard/${project.slug}/versions`]
      );

      if (!response.success) {
        form.setError('root', {
          message: response.error.message,
        });
        toast.error(response.error.message);
        return;
      }

      toast.success('Version created successfully');
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
        <Button>Create Version</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[750px]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Version</DialogTitle>
          <DialogDescription>
            Create a new version of your mock API.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- ...
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <ResizablePanelGroup
              className="rounded-lg border"
              direction="horizontal"
            >
              <ResizablePanel maxSize={100} minSize={10}>
                <Tabs>
                  <TabsList className="w-full">
                    <TabsTrigger className="basis-1/2" value="json-editor">
                      JSON Editor
                    </TabsTrigger>
                    <TabsTrigger className="basis-1/2" value="visual-editor">
                      Visual Editor
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    className="mt-0 min-h-[384px]"
                    value="json-editor"
                  >
                    <CodeMirrorEditor
                      defaultCursorPosition={defaultCursorPos}
                      defaultValue={getDefaultValue().replace('<CURSOR>', '')}
                      height="384px"
                      onValueChange={(value) => {
                        form.setValue('rawJson', value);
                      }}
                    />
                  </TabsContent>
                  <TabsContent
                    className="mt-0 min-h-[384px]"
                    value="visual-editor"
                  >
                    Not Implemented Yet
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel maxSize={100} minSize={10}>
                <div className="p-4">Two</div>
              </ResizablePanel>
            </ResizablePanelGroup>
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
