'use client';

import { DataTable } from '@components/ui/data-table';
import type { ApiSchemaLogs } from '@lib/backend/backend-types';
import type { ColumnDef } from '@tanstack/react-table';
import { toRelativeDate } from '@utils/date';
import { cn } from '@utils/tw';

const MethodToColor: Record<
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  string
> = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  PATCH: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
};

const columns: ColumnDef<ApiSchemaLogs>[] = [
  {
    header: '#',
    accessorKey: 'id',
  },
  {
    header: 'Timestamp',
    cell: ({ row }) => {
      return (
        <time dateTime={new Date(row.original.created_at).toString()}>
          {toRelativeDate(new Date(row.original.created_at))}
        </time>
      );
    },
  },
  {
    header: 'URL',
    cell: ({ row }) => {
      const url = new URL(row.original.url);
      return <p>{url.pathname}</p>;
    },
  },
  {
    header: 'Method',
    cell: ({ row }) => {
      return (
        <span
          className={cn(
            'select-none rounded-full px-2 py-1 text-center text-xs',
            MethodToColor[row.original.method]
          )}
        >
          {row.original.method}
        </span>
      );
    },
  },
  {
    header: 'Status',
    accessorKey: 'status_code',
  },
  {
    header: 'Body',
    cell: ({ row }) => {
      return (
        <pre className="font-mono text-xs">
          {JSON.stringify(
            JSON.parse(row.original.body as unknown as string),
            null,
            2
          )}
        </pre>
      );
    },
  },
  {
    header: 'Headers',
    cell: ({ row }) => {
      const headerStr = row.original.headers as unknown as string;
      const headers = Object.entries(JSON.parse(headerStr));

      const dom = headers.map(([key, value]) => {
        const safeValue = value as string;

        return (
          <p key={key}>
            <span>{key}</span>: <span>{safeValue}</span>
          </p>
        );
      });

      return <div className="space-y-1">{dom}</div>;
    },
  },
];

type Props = {
  logs: ApiSchemaLogs[];
};

export default function LogsTable({ logs }: Props) {
  return (
    <div className="w-full">
      <DataTable columns={columns} data={logs} />
    </div>
  );
}
