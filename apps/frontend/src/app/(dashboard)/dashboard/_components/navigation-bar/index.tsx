'use client';

import Container from '@components/container';
import { usePathname } from 'next/navigation';
import type { MouseEvent, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import NavigationItem from './navigation-item';

type Item = {
  label: string;
  href: string;
  ref: RefObject<HTMLAnchorElement>;
};

type Props = {
  items: Item[];
};

export default function NavigationBar({ items }: Props) {
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [indicatorOpacity, setIndicatorOpacity] = useState(0);

  const indicatorRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const activeItem = items
    .toReversed()
    .find((item) => pathname.includes(item.href));

  function onMouseEnter(e: MouseEvent<HTMLAnchorElement>) {
    const target = e.target as HTMLAnchorElement;
    const { offsetLeft, offsetWidth } = target;

    if (indicatorOpacity === 0) {
      indicatorRef.current?.style.setProperty('transition-property', 'opacity');
    } else {
      indicatorRef.current?.style.setProperty(
        'transition-property',
        'opacity,left,width'
      );
    }

    setIndicatorLeft(offsetLeft + offsetWidth / 2);
    setIndicatorWidth(offsetWidth);
    setIndicatorOpacity(1);
  }

  function moveIndicatorToActiveItem() {
    if (activeItem?.ref.current) {
      setIndicatorLeft(
        activeItem.ref.current.offsetLeft +
          activeItem.ref.current.offsetWidth / 2
      );
      setIndicatorWidth(activeItem.ref.current.offsetWidth);
    } else {
      setIndicatorOpacity(0);
    }
  }

  useEffect(() => {
    moveIndicatorToActiveItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  return (
    <nav className="relative border-b">
      <Container>
        <div
          className="pointer-events-none absolute size-full rounded-md bg-neutral-200/50 transition-[left,width,opacity] duration-150"
          ref={indicatorRef}
          style={{
            left: indicatorLeft - indicatorWidth / 2,
            width: indicatorWidth,
            opacity: indicatorOpacity,
          }}
        />

        <div className="flex items-center justify-between">
          <ul
            className="flex *:px-4 *:py-1.5"
            onMouseLeave={() => {
              setIndicatorOpacity(0);
            }}
          >
            {items.map((item) => (
              <NavigationItem
                href={item.href}
                isActive={item.href === activeItem?.href}
                key={item.href}
                onMouseEnter={onMouseEnter}
                ref={item.ref}
              >
                {item.label}
              </NavigationItem>
            ))}
          </ul>
        </div>
      </Container>
    </nav>
  );
}
