'use client';

import ReactiveTimer from '@components/reactive-timer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { CountdownTimerIcon } from '@radix-ui/react-icons';
import { toRelativeDate } from '@utils/date';

type Props = {
  createdAt: Date;
};

export default function CreatedAtTooltip({ createdAt }: Props) {
  // We don't need to use ReactiveTimer if date is > 1 hour. A bit performance optimization wouldn't hurt.
  const isDateWithinHour = Date.now() - createdAt.getTime() < 60 * 60 * 1000;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <CountdownTimerIcon className="size-4 shrink-0" />
        </TooltipTrigger>
        <TooltipContent>
          Created{' '}
          {isDateWithinHour ? (
            <ReactiveTimer
              date={createdAt}
              formatter={toRelativeDate}
              interval="second"
            />
          ) : (
            toRelativeDate(createdAt)
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
