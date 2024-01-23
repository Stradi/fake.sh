import Container from '@components/container';
import { cn } from '@utils/tw';
import type { ComponentPropsWithoutRef } from 'react';

type Props = ComponentPropsWithoutRef<'section'> & {
  title: string;
  description?: string;
};

export default function Header({
  title,
  description,
  children,
  className,
  ...props
}: Props) {
  return (
    <section className={cn('bg-neutral-100 py-8', className)} {...props}>
      <Container className="flex items-center justify-between gap-4 space-y-1">
        <div>
          <h2 className="text-lg font-medium">{title}</h2>
          {description ? <p className="text-sm">{description}</p> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
