'use client';

import useBackendClient from '@hooks/use-backend-client';
import { logout } from '@lib/backend/auth';
import { useEffect } from 'react';

// Do we really need this page? I dunno, but it's fine, I guess.
export default function Page() {
  const client = useBackendClient();

  useEffect(() => {
    if (!client) return;

    logout(client)
      .then(() => {
        window.location.href = '/';
      })
      .catch((err) => {
        throw err;
      });
  }, [client]);

  return null;
}
