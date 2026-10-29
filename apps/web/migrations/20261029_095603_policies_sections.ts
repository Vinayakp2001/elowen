import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "policies_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" jsonb NOT NULL
  );
  
  ALTER TABLE "policies_sections" ADD CONSTRAINT "policies_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "policies_sections_order_idx" ON "policies_sections" USING btree ("_order");
  CREATE INDEX "policies_sections_parent_id_idx" ON "policies_sections" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "policies_sections" CASCADE;`)
}
