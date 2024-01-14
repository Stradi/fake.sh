import { customAlphabet } from 'nanoid';
import { default as _slugify } from 'slugify';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);
export function generateId(length = 10) {
  return nanoid(length);
}

export function slugify(text: string, randomLength = 5) {
  return `${_slugify(text, {
    lower: true,
  })}${randomLength > 0 ? `-${nanoid(randomLength)}` : ''}`;
}
