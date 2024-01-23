import { Button } from '@components/ui/button';
import { cn } from '@utils/tw';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type Props = Omit<ComponentPropsWithoutRef<typeof Button>, 'variant'> & {
  label: string;
  href: string;
  variant?: 'default' | 'danger';
};

export default function AccountPopoverLink({
  label,
  href,
  variant = 'default',
  className,
  ...props
}: Props) {
  return (
    <Button
      asChild
      className={cn(
        'justify-start font-normal hover:no-underline',
        variant === 'default' && 'hover:bg-neutral-100',
        variant === 'danger' && 'text-red-600 hover:bg-red-100',
        className
      )}
      variant="link"
      {...props}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
