'use client';

import { Button } from '@components/ui/button';
import { DataTable } from '@components/ui/data-table';
import type { ApiProject, ApiSchema } from '@lib/backend/backend-types';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

type TableColumns = {
  project: ApiProject;
  schema: ApiSchema;
};

const columns: ColumnDef<TableColumns>[] = [
  {
    accessorKey: 'version',
    header: 'Version',
    cell: ({ row }) => {
      return <p>v{row.original.schema.version}</p>;
    },
  },
  {
    header: 'URL',
    cell: ({ row }) => {
      const url = `https://${row.original.project.slug}.fake.sh/api/v${row.original.schema.version}/`;
      return (
        <Link
          className="truncate text-xs text-neutral-600 hover:text-black"
          href={url}
        >
          {url}
        </Link>
      );
    },
  },
  {
    header: 'Usage',
    cell: ({ row }) => {
      // TODO: Obviously this is not the real usage, but it's a cool placeholder
      // that avoids hydration errors :D
      const randomWidths = [
        '20%',
        '50%',
        '100%',
        '30%',
        '90%',
        '80%',
        '40%',
        '60%',
        '10%',
        '70%',
      ];
      const randomWidth = randomWidths[(69 * row.index) % randomWidths.length];

      return (
        <div
          className="relative h-4 min-w-60 rounded-md bg-neutral-200 before:absolute before:left-0 before:top-0 before:h-4 before:w-[var(--width)] before:rounded-md before:bg-neutral-300"
          style={{
            // @ts-expect-error -- temporary
            '--width': randomWidth,
          }}
        />
      );
    },
  },
  {
    header: 'Actions',
    cell: () => {
      // TODO: Make this a dropdown
      return (
        <div className="flex items-center gap-1">
          <Button size="sm">Edit</Button>
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        </div>
      );
    },
  },
];

type Props = {
  versions: ApiSchema[];
  project: ApiProject;
};

export default function VersionsTable({ versions, project }: Props) {
  const data = versions.map((version) => ({
    version: version.version,
    project,
    schema: version,
  }));

  return <DataTable columns={columns} data={data} />;
}
