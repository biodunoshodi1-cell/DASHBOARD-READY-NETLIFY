CREATE TABLE "typing_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"assigned_by" integer NOT NULL,
	"level_id" text NOT NULL,
	"module_id" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
