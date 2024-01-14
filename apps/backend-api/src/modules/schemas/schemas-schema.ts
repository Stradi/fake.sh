import { projectsTable } from '@modules/projects/projects-schema';
import { relations, sql } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const schemasTable = sqliteTable('schemas', {
  id: text('id', { mode: 'text' }).primaryKey().notNull(),
  created_at: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  version: integer('version', { mode: 'number' }).notNull(),
  data: text('data', { mode: 'json' }).notNull(),

  project_id: text('project_id', { mode: 'text' })
    .notNull()
    .references((): AnySQLiteColumn => projectsTable.id),
});

export const schemasRelations = relations(schemasTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [schemasTable.project_id],
    references: [projectsTable.id],
  }),
}));
