'use client';

import ScalingDialogRoot from '@components/scaling-dialog';
import { Button } from '@components/ui/button';
import { DialogContent, DialogTrigger } from '@components/ui/dialog';
import useBackendClient from '@hooks/use-backend-client';
import { useEffect, useState } from 'react';

type Props = {
  projectId: string;
  schemaId: string;
};

export default function SchemaLogsDialog({ projectId, schemaId }: Props) {
  const backendClient = useBackendClient();
  const [logs, setLogs] = useState<unknown>(null);

  useEffect(() => {
    if (logs || !backendClient) return;

    async function fetchLogs() {
      const response = await backendClient?.sendRequest<{
        message: string;
        payload: unknown;
      }>(`/api/v1/projects/${projectId}/schemas/${schemaId}/logs`);

      if (!response?.success) return;

      setLogs(response.data.payload);
    }

    void fetchLogs();
  }, [logs, backendClient, projectId, schemaId]);

  return (
    <ScalingDialogRoot>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Logs
        </Button>
      </DialogTrigger>
      <DialogContent>
        <pre>{JSON.stringify(logs, null, 2)}</pre>
      </DialogContent>
    </ScalingDialogRoot>
  );
}
