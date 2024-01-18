import { ScalingDialogProvider } from '@components/scaling-dialog/scaling-dialog-provider';
import { cn } from '@utils/tw';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { PropsWithChildren, ReactNode } from 'react';
import './globals.css';

type Props = PropsWithChildren & {
  modal: ReactNode;
};

export default function RootLayout({ children, modal }: Props) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en">
      <body>
        <ScalingDialogProvider bodyColor="bg-black" padding={16}>
          {children}
          {modal}
        </ScalingDialogProvider>
      </body>
    </html>
  );
}
