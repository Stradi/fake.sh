'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { cn } from '@utils/tw';
import type { MouseEvent, PointerEvent } from 'react';
import { useState } from 'react';

type Props = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
};

const MethodToColor: Record<
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  string
> = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  PATCH: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
};

function getDescriptionForMethod(method: Props['method'], hasId = false) {
  switch (method) {
    case 'GET':
      return hasId ? 'Get a single resource' : 'Get a list of resources';
    case 'POST':
      return 'Create a resource';
    case 'PUT':
      return 'Replace a resource';
    case 'PATCH':
      return 'Update a resource';
    case 'DELETE':
      return 'Delete a resource';
  }
}

export default function SingleEndpoint({ method, url }: Props) {
  const [hasCopied, setHasCopied] = useState(false);

  const hasId = url.includes(':id');

  async function copyToClipboardHandler(
    e: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2500);
  }

  return (
    <Tooltip key={method}>
      <TooltipTrigger
        asChild
        className="w-full cursor-pointer text-left"
        onClick={copyToClipboardHandler}
        onPointerDown={copyToClipboardHandler}
      >
        <div className="grid grid-cols-4 gap-2">
          <span
            className={cn(
              'select-none rounded-full px-2 py-1 text-center text-xs',
              MethodToColor[method]
            )}
          >
            {method}
          </span>
          <span className="col-span-3 font-mono">
            /{url.split('/').splice(3).join('/')}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {getDescriptionForMethod(method, hasId)}
        {' - '}
        <span className={cn('text-xs', hasCopied && 'text-green-500')}>
          {hasCopied
            ? 'Copied URL to clipboard!'
            : 'Click to copy URL to clipboard'}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
