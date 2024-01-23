import type { ApiProject } from '@lib/backend/backend-types';
import { usePathname } from 'next/navigation';

type ProjectsOrUndefined = ApiProject[] | undefined;
type GetReturnType<T extends ProjectsOrUndefined> = T extends ApiProject[]
  ? ApiProject
  : string;

export default function useCurrentProject<T extends ProjectsOrUndefined>(
  projects?: T
): GetReturnType<T> | null {
  const pathname = usePathname();

  const parts = pathname.split('/');
  if (parts.length < 3) {
    return null;
  }

  if (projects) {
    const project = projects.find((p) => p.slug === parts[2]);
    if (project) {
      return project as GetReturnType<T>;
    }
    return null;
  }

  return parts[2] as GetReturnType<T>;
}
