'use client';

import type { PropsWithChildren } from 'react';
import { createContext } from 'react';
import {
  createProject,
  deleteProject,
  updateProject,
} from './projects-actions';
import type {
  CreateProjectApiFn,
  DeleteProjectApiFn,
  UpdateProjectApiFn,
} from './projects-types';

type TProjectsApiContext = {
  createProject: CreateProjectApiFn;
  updateProject: UpdateProjectApiFn;
  deleteProject: DeleteProjectApiFn;
};

const ProjectsApiContext = createContext<TProjectsApiContext>(
  {} as TProjectsApiContext
);

type Props = PropsWithChildren & {
  revalidatePaths?: string[];
};

function ProjectsApiProvider({ children, revalidatePaths = [] }: Props) {
  return (
    <ProjectsApiContext.Provider
      value={{
        createProject: createProject.bind(null, revalidatePaths),
        updateProject: updateProject.bind(null, revalidatePaths),
        deleteProject: deleteProject.bind(null, revalidatePaths),
      }}
    >
      {children}
    </ProjectsApiContext.Provider>
  );
}

export { ProjectsApiContext, ProjectsApiProvider };
