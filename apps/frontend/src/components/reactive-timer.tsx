'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Props = {
  date: Date;
  formatter?: (date: Date) => ReactNode;
  interval?: 'second' | 'minute';
};

const intervalToMs = {
  second: 1000,
  minute: 60 * 1000,
};

export default function ReactiveTimer({
  date,
  formatter,
  interval = 'second',
}: Props) {
  const [value, setValue] = useState(formatter?.(date) ?? date.toString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setValue(formatter?.(date) ?? date.toString());
    }, intervalToMs[interval]);

    return () => {
      clearInterval(intervalId);
    };
  }, [date, formatter, interval]);

  return <>{value}</>;
}
