import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import Link from 'next/link';

export default async function Page() {
  const backendClient = await createServerComponentClient();

  return (
    <div>
      {!backendClient.isAuthenticated() ? (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      ) : (
        <Link href="/logout">Logout</Link>
      )}
    </div>
  );
}
