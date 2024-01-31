'use client';

import type { ApiProject } from '@lib/backend/backend-types';
import { useEffect, type ChangeEvent } from 'react';
import InputFieldSetting from './input-field-setting';
import useUpdateSettingsStore from './use-update-settings-store';

type Props = {
  project: ApiProject;
};

export default function UpdateSettingsForm({
  project: originalProject,
}: Props) {
  const { setProject, project } = useUpdateSettingsStore((state) => ({
    setProject: state.setProject,
    project: state.project,
  }));

  useEffect(() => {
    setProject(originalProject);
  }, [originalProject, setProject]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setProject({
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="space-y-4">
      <InputFieldSetting
        defaultValue={originalProject.name}
        description="Display name of the project, used for display purposes only."
        id="name"
        label="Project Name"
        name="name"
        onChange={onChange}
        placeholder={originalProject.slug}
        value={project.name}
      />
      <hr />
      <InputFieldSetting
        defaultValue={originalProject.slug}
        description="Unique identifier of the project, used in mock API endpoints."
        id="slug"
        label="Project Slug"
        name="slug"
        onChange={onChange}
        placeholder={originalProject.name}
        value={project.slug}
      />
    </div>
  );
}
