import { Button } from '@components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { Separator } from '@components/ui/separator';
import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import AccountPopoverLink from './account-popover-link';

export default async function AccountPopover() {
  const backendClient = await createServerComponentClient();

  const account = await backendClient.getAuthenticatedAccount();
  if (!account) {
    throw new Error('You are both authenticated and not authenticated, wth?');
  }

  const canViewAdminPanel = await backendClient.checkPermission(
    'General.CanViewAdminPanel'
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="font-medium" variant="secondary">
          {account.email}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-12 rounded-full bg-neutral-200" />
          <div className="flex flex-col">
            <p className="text-sm">{account.email}</p>
          </div>
        </div>
        {canViewAdminPanel ? (
          <>
            <Separator />
            <AccountPopoverLink href="/admin" label="Admin panel" />
          </>
        ) : null}
        <Separator />
        <div className="grid grid-cols-2">
          <AccountPopoverLink
            href="/dashboard/account"
            label="Account details"
          />
          <AccountPopoverLink
            href="/dashboard/account/security"
            label="Security"
          />
          <AccountPopoverLink
            href="/dashboard/account/preferences"
            label="Preferences"
          />
          <AccountPopoverLink
            href="/dashboard/account/privacy"
            label="Privacy"
          />
          <AccountPopoverLink href="/logout" label="Log out" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
