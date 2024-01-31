'use client';

import { Button } from '@components/ui/button';
import type { ApiProject } from '@lib/backend/backend-types';
import useProjectsApi from '@lib/backend/projects/use-projects-api';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import useUpdateSettingsStore from './use-update-settings-store';

type Props = {
  project: ApiProject;
};

export default function ReactiveSaveButton({
  project: originalProject,
}: Props) {
  const [isSending, setIsSending] = useState(false);

  const project = useUpdateSettingsStore((state) => state.project);
  const projectsApi = useProjectsApi();
  const router = useRouter();

  const hasChanges = useMemo(() => {
    for (const key in project) {
      if (project[key] !== originalProject[key]) {
        return true;
      }
    }

    return false;
  }, [project, originalProject]);

  const isInputValid = useMemo(() => {
    if (
      !project.name ||
      !project.slug ||
      project.name === '' ||
      project.slug === ''
    ) {
      return false;
    }

    return true;
  }, [project]);

  async function onClick() {
    if (!hasChanges || !isInputValid) {
      return;
    }

    setIsSending(true);

    const response = await projectsApi.updateProject(
      originalProject.id,
      project
    );

    setIsSending(false);

    if (!response.success) {
      toast.error(response.error.message);
      return;
    }

    toast.success('Project updated successfully');
    router.push(`/dashboard/${response.data.payload.slug}/settings`);
  }

  return (
    <Button
      disabled={!hasChanges || !isInputValid || isSending}
      onClick={onClick}
    >
      Save Changes
    </Button>
  );
}
