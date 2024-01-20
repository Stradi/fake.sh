import { Button } from '@components/ui/button';
import Link from 'next/link';

type Props = {
  label: string;
  href: string;
};

export default function AccountPopoverLink({ label, href }: Props) {
  return (
    <Button
      asChild
      className="justify-start font-normal hover:bg-neutral-100 hover:no-underline"
      variant="link"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
