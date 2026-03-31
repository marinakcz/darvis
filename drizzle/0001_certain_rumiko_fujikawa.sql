ALTER TABLE "jobs" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "loss_reason" varchar(50);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "loss_note" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "win_reason" varchar(50);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "win_note" text;