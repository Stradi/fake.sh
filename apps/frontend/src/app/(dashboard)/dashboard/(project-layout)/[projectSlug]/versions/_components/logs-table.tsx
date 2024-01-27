'use client';

import { DataTable } from '@components/ui/data-table';
import type { ApiSchemaLogs } from '@lib/backend/backend-types';
import type { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<ApiSchemaLogs>[] = [
  {
    header: '#',
    accessorKey: 'id',
  },
  {
    header: 'Timestamp',
    accessorKey: 'created_at',
  },
  {
    header: 'URL',
    accessorKey: 'url',
  },
  {
    header: 'Method',
    accessorKey: 'method',
  },
  {
    header: 'Status',
    accessorKey: 'status_code',
  },
  {
    header: 'Body',
    cell: ({ row }) => {
      return <p>{JSON.stringify(row.original.body)}</p>;
    },
  },
  {
    header: 'Headers',
    cell: ({ row }) => {
      return <p>{JSON.stringify(row.original.headers)}</p>;
    },
  },
];

type Props = {
  logs: ApiSchemaLogs[];
};

export default function LogsTable({ logs }: Props) {
  return (
    <div className="w-fit">
      <DataTable columns={columns} data={logs} />
    </div>
  );
}
