'use client';

import { Button } from '@components/ui/button';
import { DataTable } from '@components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import type { ApiProject, ApiSchema } from '@lib/backend/backend-types';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import DeleteVersionAlertDialog from './delete-version-alert-dialog';
import SchemaLogsDialog from './schema-logs-dialog';

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
    cell: ({ row }) => {
      // TODO: Make this a dropdown
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <DotsHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <SchemaLogsDialog
              projectId={row.original.project.id}
              schemaId={row.original.schema.id}
            />
            {/* <InspectDataDialog />
            <DeleteVersionDialog /> */}
            <DeleteVersionAlertDialog
              projectId={row.original.project.id}
              projectSlug={row.original.project.slug}
              schemaId={row.original.schema.id}
            />
          </DropdownMenuContent>
        </DropdownMenu>
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
