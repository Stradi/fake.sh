'use client';

import { useContext } from 'react';
import { ProjectsApiContext } from './projects-api-provider';

export default function useProjectsApi() {
  const api = useContext(ProjectsApiContext);
  return api;
}
