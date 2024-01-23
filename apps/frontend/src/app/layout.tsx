import ComposeProviders from '@components/compose-providers';
import { ScalingDialogProvider } from '@components/scaling-dialog/scaling-dialog-provider';
import { Toaster } from '@components/ui/sonner';
import { ProjectsApiProvider } from '@lib/backend/projects/projects-api-provider';
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
        <Toaster />
        <ComposeProviders
          providers={[
            [ScalingDialogProvider, { bodyColor: 'bg-black', padding: 16 }],
            [
              ProjectsApiProvider,
              {
                revalidatePaths: ['/dashboard'],
              },
            ],
          ]}
        >
          {children}
          {modal}
        </ComposeProviders>
      </body>
    </html>
  );
}
