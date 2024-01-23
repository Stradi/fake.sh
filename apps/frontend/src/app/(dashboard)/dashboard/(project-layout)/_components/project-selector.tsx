'use client';

import { Button } from '@components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { ScrollArea } from '@components/ui/scroll-area';
import { Separator } from '@components/ui/separator';
import useCurrentProject from '@hooks/use-current-project';
import type { ApiProject } from '@lib/backend/backend-types';
import { cn } from '@utils/tw';
import Link from 'next/link';
import CreateProjectDialog from '../../(general-layout)/_components/create-project-dialog';

type Props = {
  projects: ApiProject[];
};

// TODO: This looks ugly, fix it.
export default function ProjectSelector({ projects }: Props) {
  const currentProject = useCurrentProject(projects);
  if (!currentProject) return <>Loading</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="px-2 text-sm" size="sm" variant="ghost">
          {currentProject.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Projects ({projects.length})</p>
          <CreateProjectDialog />
        </div>
        <Separator />
        <ScrollArea className="h-72 w-full gap-0.5">
          <div className="grid grid-cols-2">
            {projects.toReversed().map((project) => (
              <Link
                href={`/dashboard/${project.slug}`}
                key={project.id}
                passHref
              >
                <Button
                  className={cn(
                    'w-full max-w-full justify-start truncate text-sm font-normal',
                    project.id === currentProject.id && 'font-medium'
                  )}
                  disabled={project.id === currentProject.id}
                  size="sm"
                  variant="ghost"
                >
                  {project.name}
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
