import { log } from './logger';

// TODO: We should use keyof NodeJS.ProcessEnv for `name` but doesn't work :(
export function env(name: string, defaultValue?: string): string;
export function env(name: string, defaultValue?: number): number;
export function env(name: string, defaultValue?: string | number) {
  const value = process.env[name];
  if (!value) {
    if (defaultValue) {
      if (typeof defaultValue === 'string') {
        if (defaultValue.length) return defaultValue;
      } else {
        return defaultValue;
      }
    }

    log.fatal(`Missing environment variable: ${name}`);
    process.exit(1);
  }

  if (typeof defaultValue === 'string') return value;

  const number = tryParseInt(value);
  if (number) return number;

  log.fatal(`Invalid environment variable ${name}=${value}, expected number`);
  process.exit(1);
}

function tryParseInt(value: string) {
  const parsed = parseInt(value);
  if (isNaN(parsed)) return null;

  return parsed;
}
