import type { Config } from 'drizzle-kit';

export default {
  schema: [
    './src/modules/**/*-schema.ts',
    './src/lib/database/schemas/**/*-schema.ts',
  ],
  out: './src/lib/database/generated',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './data/main.sqlite',
  },
} satisfies Config;
