import { schemasTable } from '@modules/schemas/schemas-schema';
import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projectsTable = sqliteTable('projects', {
  id: text('id', { mode: 'text' }).primaryKey().notNull(),
  created_at: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  name: text('name', { mode: 'text' }).notNull(),
  slug: text('slug', { mode: 'text' }).notNull().unique(),
});

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  schemas: many(schemasTable),
}));
