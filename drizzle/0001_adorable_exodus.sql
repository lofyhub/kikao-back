ALTER TABLE "users" ALTER COLUMN "gender" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "merchant_request_id" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "checkout_request_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "response_code" varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "response_description" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "customer_message" varchar(100) NOT NULL;