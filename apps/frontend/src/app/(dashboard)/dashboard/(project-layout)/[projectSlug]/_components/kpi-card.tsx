'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { useMousePosition } from '@hooks/use-mouse-position';
import { cn } from '@utils/tw';
import { useRef, type ReactNode } from 'react';

type Props = {
  title: ReactNode;
  metric: ReactNode;
  progress?: {
    value: number;
    startText?: ReactNode;
    endText?: ReactNode;
    tooltip?: ReactNode;
  };
  footer?: ReactNode;
};

const ProgressToColor = (progress: number) => {
  if (progress <= 40) {
    return 'bg-green-500';
  } else if (progress <= 70) {
    return 'bg-amber-500';
  }
  return 'bg-red-500';
};

export default function KpiCard({ title, metric, progress, footer }: Props) {
  const { ref, x } = useMousePosition<HTMLDivElement>();
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full space-y-2 rounded-md border p-4 transition duration-100 hover:border-neutral-400">
      <div>
        <p className="text-sm text-neutral-500">{title}</p>
        <p className="text-2xl font-medium">{metric}</p>
      </div>
      {progress ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1" ref={ref}>
                {progress.startText && progress.endText ? (
                  <div className="flex justify-between text-sm text-neutral-500">
                    <p>{progress.startText}</p>
                    <p>{progress.endText}</p>
                  </div>
                ) : null}
                <div className="relative h-2 w-full rounded-full bg-neutral-200">
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full',
                      ProgressToColor(progress.value)
                    )}
                    style={{
                      width: `${progress.value}%`,
                    }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            {progress.tooltip ? (
              <TooltipContent
                align="start"
                alignOffset={
                  tooltipRef.current
                    ? x - tooltipRef.current.offsetWidth / 2
                    : x
                }
                ref={tooltipRef}
              >
                {progress.tooltip}
              </TooltipContent>
            ) : null}
          </Tooltip>
        </TooltipProvider>
      ) : null}
      {footer ? (
        <div className="text-right text-sm text-neutral-500">{footer}</div>
      ) : null}
    </div>
  );
}
