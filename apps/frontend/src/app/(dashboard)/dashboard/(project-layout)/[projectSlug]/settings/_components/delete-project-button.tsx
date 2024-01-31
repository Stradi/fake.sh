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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  project: ApiProject;
};

export default function DeleteProjectButton({ project }: Props) {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const projectsApi = useProjectsApi();
  const router = useRouter();

  async function onClick() {
    setIsSending(true);

    const response = await projectsApi.deleteProject(project.id);

    if (!response.success) {
      toast.error(response.error.message);
      setIsSending(false);
      return;
    }

    toast.success('Project deleted successfully');

    setIsSending(false);
    setOpen(false);

    router.push('/dashboard');
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
          <Label>Delete Project</Label>
          <p className="text-sm text-neutral-600">
            This action cannot be undone. This will permanently delete the
            project and all the data associated with it.
          </p>
        </div>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete project</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and all the data associated with it.
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
