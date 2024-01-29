'use client';

import useBackendClient from '@hooks/use-backend-client';
import { useEffect, useState } from 'react';

type Props = {
  projectId: string;
  schemaId: string;
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'millennium';
};

export default function UsageWidget({
  projectId,
  schemaId,
  timeframe = 'hour',
}: Props) {
  const backendClient = useBackendClient();
  const [usage, setUsage] = useState<null | number>(null);

  useEffect(() => {
    async function fetchUsage() {
      const response = await backendClient?.sendRequest<{
        message: string;
        payload: {
          count: number;
        };
      }>(
        `/api/v1/projects/${projectId}/schemas/${schemaId}/usage?timeframe=${timeframe}`
      );

      if (!response?.success) {
        setUsage(null);
        return;
      }

      setUsage(response.data.payload.count);
    }

    if (usage || !backendClient) return;
    void fetchUsage();
  }, [projectId, schemaId, backendClient, usage, timeframe]);

  return (
    <div className="flex flex-col gap-0.5 rounded-md border bg-neutral-50 px-1 py-0.5">
      <p className="text-xs text-neutral-500">
        {timeframe.slice(0, 1).toUpperCase() + timeframe.slice(1)}
      </p>
      <p className="font-medium text-neutral-700">
        <span className="font-mono">{usage}</span> requests
      </p>
    </div>
  );
}
