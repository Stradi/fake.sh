import InterceptorModal from '@components/interceptor-modal';
import LoginForm from '@components/login-form';
import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import Link from 'next/link';

type Props = {
  searchParams: {
    depth?: string;
  };
};

export default function Page({ searchParams }: Props) {
  const currentDepth = searchParams.depth ? parseInt(searchParams.depth) : 1;

  return (
    <InterceptorModal depth={currentDepth + 1} title="Login to Your Account">
      <LoginForm />
      <Separator />
      <div className="flex flex-col items-center gap-1 text-sm">
        <p>
          Don&apos;t have an account?{' '}
          <Button asChild className="h-auto p-0" variant="link">
            <Link href={`/register?depth=${currentDepth + 1}`} shallow={false}>
              Create an account
            </Link>
          </Button>
        </p>
        <p>
          Forgot your password?{' '}
          <Button asChild className="h-auto p-0" variant="link">
            <Link
              href={`/forgot-password?depth=${currentDepth + 1}`}
              shallow={false}
            >
              Reset it
            </Link>
          </Button>
        </p>
      </div>
    </InterceptorModal>
  );
}
