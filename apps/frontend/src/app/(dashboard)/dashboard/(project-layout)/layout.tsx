import Link from 'next/link';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren;

export default function Layout({ children }: Props) {
  const projectSlug = 'test';

  return (
    <section>
      <header>
        <Link href={`/dashboard/${projectSlug}`}>Project Overview</Link> -{' '}
        <Link href={`/dashboard/${projectSlug}/versions`}>Versions</Link> -{' '}
        <Link href={`/dashboard/${projectSlug}/usage`}>Usage</Link>
      </header>
      <main>{children}</main>
    </section>
  );
}
