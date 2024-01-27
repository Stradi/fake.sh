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
import { startTransition, useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import GeneratedEndpoints from './generated-endpoints';
import JsonEditor from './json-editor';
import VisualEditor from './visual-editor';

type Props = {
  project: ApiProject;
  previousVersion?: ApiSchema;
};

const CreateVersionFormSchema = z.object({
  rawJson: z.string(),
});

type CreateVersionFormType = z.infer<typeof CreateVersionFormSchema>;

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

  }
}`;
    }

    const version = previousVersion.version + 1;
    const data = previousVersion.data;

    return JSON.stringify({ version, data }, null, 2);
  }, [previousVersion]);

  function validateJson(
    value: string
  ):
    | { isValid: true; errorMessage: undefined }
    | { isValid: false; errorMessage: string } {
    try {
      JSON.parse(value);
    } catch {
      return {
        isValid: false,
        errorMessage: 'JSON is not parsable, please check for syntax errors',
      };
    }

    const { success: isSchemaValid } = CreateSchemaFormSchema.safeParse(
      JSON.parse(value)
    );
    if (!isSchemaValid) {
      return {
        isValid: false,
        errorMessage: 'JSON does not match schema',
      };
    }

    return {
      isValid: true,
      errorMessage: undefined,
    };
  }

  const form = useForm<CreateVersionFormType>({
    resolver: zodResolver(CreateVersionFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      rawJson: getDefaultValue(),
    },
  });

  form.watch('rawJson');

  const rawJsonValidationResult = useMemo(() => {
    return validateJson(form.getValues().rawJson);
  }, [form.getValues().rawJson]);

  function onSubmit(formData: CreateVersionFormType) {
    if (!rawJsonValidationResult.isValid) {
      form.setError('root', {
        message: rawJsonValidationResult.errorMessage,
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
                <Tabs defaultValue="visual-editor">
                  <TabsList className="w-full rounded-none">
                    <TabsTrigger className="basis-1/2" value="json-editor">
                      JSON Editor
                    </TabsTrigger>
                    <TabsTrigger className="basis-1/2" value="visual-editor">
                      Visual Editor
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    className="m-0 min-h-[384px]"
                    value="json-editor"
                  >
                    <JsonEditor
                      height="384px"
                      onValueChange={(value) => {
                        form.setValue('rawJson', value);
                      }}
                      value={form.getValues().rawJson}
                    />
                  </TabsContent>
                  <TabsContent
                    className="m-0 min-h-[384px]"
                    value="visual-editor"
                  >
                    <VisualEditor
                      height="384px"
                      onValueChange={(value) => {
                        form.setValue('rawJson', value);
                      }}
                      value={
                        rawJsonValidationResult.isValid
                          ? form.getValues().rawJson
                          : undefined
                      }
                    />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel maxSize={100} minSize={10}>
                <GeneratedEndpoints
                  height="420px"
                  project={project}
                  value={
                    rawJsonValidationResult.isValid
                      ? form.getValues().rawJson
                      : undefined
                  }
                />
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
