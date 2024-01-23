import Link from 'next/link';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren;

export default function Layout({ children }: Props) {
  return (
    <section>
      <header>
        <Link href="/dashboard">All Projects</Link> -{' '}
        <Link href="/dashboard/settings">Settings</Link>
      </header>
      <main>{children}</main>
    </section>
  );
}
