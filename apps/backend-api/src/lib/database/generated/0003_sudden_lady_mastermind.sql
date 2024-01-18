ALTER TABLE "projects" DROP CONSTRAINT "projects_created_by_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "schemas" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "accounts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schemas" ADD CONSTRAINT "schemas_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "accounts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
