import { projectsTable } from '@modules/projects/projects-schema';
import { relations, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const schemasTable = pgTable('schemas', {
  id: text('id').primaryKey().notNull(),
  created_at: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  version: integer('version').notNull(),
  data: text('data').notNull(), // Maybe JSONB or JSON?

  project_id: text('project_id')
    .notNull()
    .references((): AnyPgColumn => projectsTable.id),
});

export const schemasRelations = relations(schemasTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [schemasTable.project_id],
    references: [projectsTable.id],
  }),
}));
