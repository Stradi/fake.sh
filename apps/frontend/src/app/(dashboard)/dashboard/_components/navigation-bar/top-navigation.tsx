import Container from '@components/container';
import type { ReactNode } from 'react';

type Props = {
  subText?: ReactNode;
  rightSide?: ReactNode;
};
export default function TopNavigation({ subText, rightSide }: Props) {
  return (
    <Container>
      <nav className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">fake.sh</p>
          {subText ? (
            <>
              <span className="rotate-12 select-none text-lg font-medium text-neutral-300">
                /
              </span>
              <p className="text-sm font-medium">{subText}</p>
            </>
          ) : null}
        </div>
        {rightSide ? <div>{rightSide}</div> : null}
      </nav>
    </Container>
  );
}
