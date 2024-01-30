import type { ComponentPropsWithoutRef } from 'react';
import SideNavigationItem from './side-navigation-item';

type Props = ComponentPropsWithoutRef<'aside'> & {
  items: {
    label: string;
    href: string;
  }[];
};

export default function SideNavigation({ items, ...props }: Props) {
  return (
    <aside {...props}>
      <ul className="flex flex-col">
        {items.map((item) => (
          <SideNavigationItem href={item.href} key={item.href}>
            {item.label}
          </SideNavigationItem>
        ))}
      </ul>
    </aside>
  );
}
