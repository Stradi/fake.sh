'use client';

import type { PropsWithChildren } from 'react';
import { createContext } from 'react';
import { createProject } from './projects-actions';
import type { CreateProjectApiFn } from './projects-types';

type TProjectsApiContext = {
  createProject: CreateProjectApiFn;
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
      }}
    >
      {children}
    </ProjectsApiContext.Provider>
  );
}

export { ProjectsApiContext, ProjectsApiProvider };
