ALTER TABLE "schemas" DROP CONSTRAINT "schemas_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "account_group" DROP CONSTRAINT "account_group_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "group_permission" DROP CONSTRAINT "group_permission_group_id_groups_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schemas" ADD CONSTRAINT "schemas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_group" ADD CONSTRAINT "account_group_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_permission" ADD CONSTRAINT "group_permission_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
