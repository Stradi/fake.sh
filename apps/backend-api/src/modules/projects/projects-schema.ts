import { schemasTable } from '@modules/schemas/schemas-schema';
import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const projectsTable = pgTable('projects', {
  id: text('id').primaryKey().notNull(),
  created_at: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  schemas: many(schemasTable),
}));
