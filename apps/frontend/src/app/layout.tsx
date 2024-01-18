import type { PropsWithChildren } from 'react';
import './globals.css';

type Props = PropsWithChildren;
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
