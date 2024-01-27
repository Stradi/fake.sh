'use client';

import ScalingDialogRoot from '@components/scaling-dialog';
import { Button } from '@components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { ScrollArea, ScrollBar } from '@components/ui/scroll-area';
import useBackendClient from '@hooks/use-backend-client';
import type { ApiSchemaLogs } from '@lib/backend/backend-types';
import { useEffect, useState } from 'react';
import LogsTable from './logs-table';

type Props = {
  projectId: string;
  schemaId: string;
};

export default function SchemaLogsDialog({ projectId, schemaId }: Props) {
  const backendClient = useBackendClient();
  const [logs, setLogs] = useState<ApiSchemaLogs[] | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      const response = await backendClient?.sendRequest<{
        message: string;
        payload: ApiSchemaLogs[];
      }>(`/api/v1/projects/${projectId}/schemas/${schemaId}/logs?limit=100`);

      if (!response?.success) {
        setLogs([]);
        return;
      }

      setLogs(response.data.payload);
    }

    if (logs || !backendClient) return;
    void fetchLogs();
  }, [logs, backendClient, projectId, schemaId]);

  return (
    <ScalingDialogRoot>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Logs</DialogTitle>
          <DialogDescription>
            Showing the last 100 logs for this version of your API. Newest logs
            are shown first.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh]">
          <ScrollBar orientation="horizontal" />
          <LogsTable logs={logs ?? []} />
        </ScrollArea>
      </DialogContent>
    </ScalingDialogRoot>
  );
}
