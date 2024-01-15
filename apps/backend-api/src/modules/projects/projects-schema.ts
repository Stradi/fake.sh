import { accountsTable } from '@modules/accounts/accounts-schema';
import { schemasTable } from '@modules/schemas/schemas-schema';
import { relations, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
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
  created_by: text('created_by')
    .notNull()
    .references((): AnyPgColumn => accountsTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
});

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  schemas: many(schemasTable),
  owner: one(accountsTable, {
    fields: [projectsTable.created_by],
    references: [accountsTable.id],
  }),
}));
