import type BackendClient from '@lib/backend/client';
import createClientComponentClient from '@lib/backend/client/create-client-component-client';
import { useEffect, useState } from 'react';

export default function useClient() {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- false positive
  const [backendClient, setBackendClient] = useState<BackendClient | null>(
    null
  );

  useEffect(() => {
    createClientComponentClient()
      .then((client) => {
        setBackendClient(client);
      })
      .catch((err) => {
        throw new Error(err);
      });
  }, []);

  return backendClient;
}
