'use client';

import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import type { ComponentPropsWithoutRef } from 'react';

type Props = ComponentPropsWithoutRef<typeof Input> & {
  label: string;
  description: string;
};

export default function InputFieldSetting({
  label,
  description,
  id,
  value,
  defaultValue,
  ...props
}: Props) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-2">
        <Label htmlFor={id}>{label}</Label>{' '}
        {value !== defaultValue && (
          <span className="text-xs text-neutral-600">(changed)</span>
        )}
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <div className="col-span-3 flex gap-2">
        <Input defaultValue={defaultValue} id={id} value={value} {...props} />
      </div>
    </div>
  );
}
