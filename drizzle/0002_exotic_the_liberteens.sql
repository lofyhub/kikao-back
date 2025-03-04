ALTER TABLE "payments" ADD COLUMN "result_description" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "mpesa_receipt_number" varchar(20);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "transaction_date" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "result_code" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "amount";