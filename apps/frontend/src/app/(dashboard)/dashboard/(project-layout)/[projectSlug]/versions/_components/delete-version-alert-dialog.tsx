'use client';

import ScalingAlertDialogRoot from '@components/scaling-dialog/scaling-alert-dialog';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { DropdownMenuItem } from '@components/ui/dropdown-menu';
import useSchemasApi from '@lib/backend/schemas/use-schemas-api';
import { TrashIcon } from '@radix-ui/react-icons';
import { startTransition, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  projectId: string;
  schemaId: string;
  projectSlug: string;
};

export default function DeleteVersionAlertDialog({
  projectId,
  schemaId,
  projectSlug,
}: Props) {
  const api = useSchemasApi();
  const [open, setOpen] = useState(false);

  function handleSubmit() {
    // @ts-expect-error -- react@beta supports async functions in startTransition
    startTransition(async () => {
      const response = await api.deleteSchema(projectId, schemaId, [
        `/dashboard/${projectSlug}/versions`,
      ]);

      if (!response.success) {
        toast.error(response.error.message);
        return;
      }

      toast.success('Version deleted');
      setOpen(false);
    });
  }

  return (
    <ScalingAlertDialogRoot
      onClose={() => {
        setOpen(false);
      }}
      onOpen={() => {
        setOpen(true);
      }}
      open={open}
    >
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="gap-x-2 hover:bg-red-100"
          onSelect={(e) => e.preventDefault()}
        >
          <TrashIcon /> Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete version?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this version? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Yes, delete</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </ScalingAlertDialogRoot>
  );
}
