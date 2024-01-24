'use client';

import { DataTable } from '@components/ui/data-table';
import type { ApiSchema } from '@lib/backend/backend-types';
import type { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<ApiSchema>[] = [
  {
    accessorKey: 'version',
    header: 'Version',
  },
  {
    accessorKey: 'project.name',
    header: 'Project Name',
  },
  {
    header: 'Usage',
  },
  {
    header: 'Actions',
  },
];

type Props = {
  versions: ApiSchema[];
};

export default function VersionsTable({ versions }: Props) {
  return <DataTable columns={columns} data={versions} />;
}
