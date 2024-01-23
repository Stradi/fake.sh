import type { ApiProject } from '@lib/backend/backend-types';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { cn } from '@utils/tw';
import Link from 'next/link';
import CreatedAtTooltip from './created-at-tooltip';

type Props = ApiProject;

export default function ProjectCard({
  slug,
  name,
  schemas,
  created_at: createdAt,
}: Props) {
  const isDateWithinHour =
    Date.now() - new Date(createdAt).getTime() < 60 * 60 * 1000;

  return (
    <Link
      className={cn(
        'group relative overflow-hidden rounded-md p-2 ring-1 ring-neutral-300 transition duration-100',
        'hover:ring-black hover:ring-offset-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'
      )}
      href={`/dashboard/${slug}`}
    >
      {isDateWithinHour ? (
        <div className="absolute -right-4 top-0.5 rotate-45 bg-green-700 px-4 text-xs text-green-200">
          new
        </div>
      ) : null}
      <section className="flex flex-col justify-between gap-8">
        <header className="flex flex-col gap-1">
          <p className="relative flex items-center gap-1 truncate transition">
            <ChevronRightIcon className="absolute -left-2 inline shrink-0 opacity-0 transition-[opacity,left] group-hover:-left-1 group-hover:opacity-100" />
            <span className="truncate text-neutral-700 transition-[color,transform] group-hover:translate-x-2.5 group-hover:text-black">
              {name}
            </span>
          </p>
          <p className="truncate text-sm text-neutral-500">
            http://{slug}.fake.sh/
          </p>
        </header>
        <footer className="flex items-center justify-between text-sm text-neutral-500">
          <div className="space-x-4">
            <span>{schemas.length} versions</span>
            <span>~450 requests/day</span>
          </div>
          <CreatedAtTooltip createdAt={new Date(createdAt)} />
        </footer>
      </section>
    </Link>
  );
}
