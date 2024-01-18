import { cn } from '@utils/tw';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { PropsWithChildren } from 'react';
import './globals.css';

type Props = PropsWithChildren;
export default function RootLayout({ children }: Props) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en">
      <body>{children}</body>
    </html>
  );
}
