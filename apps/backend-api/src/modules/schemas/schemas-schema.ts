import { projectsTable } from '@modules/projects/projects-schema';
import { relations } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const schemasTable = sqliteTable('schemas', {
  id: text('id', { mode: 'text' }).primaryKey().notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),

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
