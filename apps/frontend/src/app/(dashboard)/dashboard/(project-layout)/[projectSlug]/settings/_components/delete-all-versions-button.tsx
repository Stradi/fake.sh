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
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import type { ApiProject } from '@lib/backend/backend-types';
import useProjectsApi from '@lib/backend/projects/use-projects-api';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  project: ApiProject;
};

export default function DeleteAllVersionsButton({ project }: Props) {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const projectsApi = useProjectsApi();

  async function onClick() {
    setIsSending(true);

    const response = await projectsApi.deleteAllVersions(project.id);

    if (!response.success) {
      toast.error(response.error.message);
      setIsSending(false);
      return;
    }

    toast.success('Successfully deleted all versions of the project.');

    setIsSending(false);
    setOpen(false);
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
      <div className="flex items-center justify-between gap-4">
        <div className="col-span-2">
          <Label>Delete all versions</Label>
          <p className="text-sm text-neutral-600">
            This action cannot be undone. This will permanently delete all the
            versions associated with the project.
          </p>
        </div>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete all versions</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all versions?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all the
              versions associated with the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isSending} onClick={onClick}>
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </ScalingAlertDialogRoot>
  );
}
