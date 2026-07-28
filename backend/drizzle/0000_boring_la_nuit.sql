CREATE TYPE "public"."appointment_status" AS ENUM('pendiente', 'confirmada', 'completada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."commission_status" AS ENUM('pendiente', 'pagada');--> statement-breakpoint
CREATE TYPE "public"."inventory_type" AS ENUM('uso', 'venta');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'colaborador', 'cliente');--> statement-breakpoint
CREATE TABLE "appointment_services" (
	"appointment_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "appointment_services_appointment_id_service_id_pk" PRIMARY KEY("appointment_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'pendiente' NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"email" text,
	"ip" text,
	"user_agent" text,
	"success" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_id" uuid NOT NULL,
	"operation" text NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caja_id" uuid NOT NULL,
	"appointment_id" uuid,
	"tipo" text NOT NULL,
	"monto" numeric(10, 2) NOT NULL,
	"concepto" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"apertura" timestamp DEFAULT now() NOT NULL,
	"cierre" timestamp,
	"monto_inicial" numeric(10, 2) NOT NULL,
	"monto_esperado" numeric(10, 2),
	"monto_real" numeric(10, 2),
	"diferencia" numeric(10, 2),
	"estado" text DEFAULT 'abierta' NOT NULL,
	"notas" text
);
--> statement-breakpoint
CREATE TABLE "client_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"reward_id" uuid NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	"code" text NOT NULL,
	CONSTRAINT "client_rewards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"dni" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "clients_dni_unique" UNIQUE("dni")
);
--> statement-breakpoint
CREATE TABLE "colaboradores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"full_name" text NOT NULL,
	"phone" text,
	"specialty" text,
	"commission_pct" numeric(5, 2) DEFAULT '0',
	"is_available" boolean DEFAULT true NOT NULL,
	"color_tag" text
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "commission_status" DEFAULT 'pendiente' NOT NULL,
	"settled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "inventory_type" NOT NULL,
	"category" text,
	"stock_qty" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric(10, 2),
	"supplier" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"ip" text NOT NULL,
	"success" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_redeemed" integer DEFAULT 0 NOT NULL,
	"tier_id" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_points_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "loyalty_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"points_cost" integer NOT NULL,
	"reward_type" text NOT NULL,
	"reward_value" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"min_points" integer DEFAULT 0 NOT NULL,
	"discount_pct" numeric(5, 2) DEFAULT '0',
	"color" text DEFAULT '#C9A227',
	"benefits" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_tiers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"appointment_id" uuid,
	"points" integer NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"channel" text NOT NULL,
	"recipient_id" text,
	"title" text,
	"body" text NOT NULL,
	"metadata" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"inventory_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" text,
	"payment_status" text DEFAULT 'pendiente',
	"paid_at" timestamp,
	"shipping_address" text,
	"delivery_method" text DEFAULT 'recojo',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"code" text NOT NULL,
	"discount_pct" numeric(5, 2) DEFAULT '10',
	"usage_count" integer DEFAULT 0 NOT NULL,
	"max_uses" integer DEFAULT 5,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_codes_client_id_unique" UNIQUE("client_id"),
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_code_id" uuid NOT NULL,
	"referred_client_id" uuid NOT NULL,
	"appointment_id" uuid,
	"discount_applied" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"service_id" uuid,
	"rating" integer NOT NULL,
	"comment" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "service_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"appointment_id" uuid,
	"service_id" uuid,
	"details" jsonb,
	"performed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"duration_min" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_mfa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"secret" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_mfa_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"name" text NOT NULL,
	"phone" text,
	"role" "role" DEFAULT 'cliente' NOT NULL,
	"avatar_url" text,
	"security_question" text,
	"security_answer_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_caja_id_cash_registers_id_fk" FOREIGN KEY ("caja_id") REFERENCES "public"."cash_registers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_registers" ADD CONSTRAINT "cash_registers_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_rewards" ADD CONSTRAINT "client_rewards_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_rewards" ADD CONSTRAINT "client_rewards_reward_id_loyalty_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_tier_id_loyalty_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."loyalty_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usage" ADD CONSTRAINT "referral_usage_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usage" ADD CONSTRAINT "referral_usage_referred_client_id_clients_id_fk" FOREIGN KEY ("referred_client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usage" ADD CONSTRAINT "referral_usage_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_colaborador_id_colaboradores_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mfa" ADD CONSTRAINT "user_mfa_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;