CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"catalog_id" varchar(100) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"disassembly" boolean DEFAULT false NOT NULL,
	"packing" boolean DEFAULT false NOT NULL,
	"assembly" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "job_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"custom_name" varchar(255),
	"mode" varchar(20) DEFAULT 'quick' NOT NULL,
	"percent" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"job_type" varchar(50) DEFAULT 'apartment' NOT NULL,
	"vehicle_id" varchar(50) DEFAULT 'medium-24' NOT NULL,
	"pickup_address" text DEFAULT '' NOT NULL,
	"pickup_floor" integer DEFAULT 0 NOT NULL,
	"pickup_elevator" boolean DEFAULT false NOT NULL,
	"delivery_address" text DEFAULT '' NOT NULL,
	"delivery_floor" integer DEFAULT 0 NOT NULL,
	"delivery_elevator" boolean DEFAULT false NOT NULL,
	"distance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"access" jsonb,
	"date" varchar(20),
	"time" varchar(5),
	"materials" jsonb,
	"technician_notes" text,
	"dispatcher_note" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"from_crm" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"token" varchar(50) NOT NULL,
	"total_volume" numeric(10, 2) NOT NULL,
	"truck_count" integer NOT NULL,
	"worker_count" integer NOT NULL,
	"estimated_hours" numeric(10, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"breakdown" jsonb NOT NULL,
	"materials" jsonb NOT NULL,
	"client_note" text,
	"status" varchar(50) DEFAULT 'sent' NOT NULL,
	"valid_until" timestamp,
	"viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "offers_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "job_events" ADD CONSTRAINT "job_events_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_items" ADD CONSTRAINT "job_items_room_id_job_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."job_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_rooms" ADD CONSTRAINT "job_rooms_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;