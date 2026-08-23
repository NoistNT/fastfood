-- ============================================================
-- dev-reset · FastFood R1 schema baseline
-- Nuke → recreate. Mirrors db/schema.ts exactly (single source
-- of truth for types lives there; CI applies this file on every
-- PR run against the ci-e2e branch as a drift canary).
--
-- DESTRUCTIVE: dev/CI branches only — never run against prod.
-- Apply via Neon SQL Editor or: psql "$DB_URL" -f scripts/sql/dev-reset.sql
-- ============================================================

BEGIN;

-- ============ NUKE ============
DROP TABLE IF EXISTS public.inventory_alerts      CASCADE;
DROP TABLE IF EXISTS public.inventory_movements   CASCADE;
DROP TABLE IF EXISTS public.inventory             CASCADE;
DROP TABLE IF EXISTS public.addresses             CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.order_status_history  CASCADE;
DROP TABLE IF EXISTS public.order_item            CASCADE;
DROP TABLE IF EXISTS public.orders                CASCADE;
DROP TABLE IF EXISTS public.product_ingredients   CASCADE;
DROP TABLE IF EXISTS public.ingredients           CASCADE;
DROP TABLE IF EXISTS public.products              CASCADE;
DROP TABLE IF EXISTS public.user_roles            CASCADE;
DROP TABLE IF EXISTS public.roles                 CASCADE;
DROP TABLE IF EXISTS public.users                 CASCADE;

DROP TYPE IF EXISTS public.order_status     CASCADE;
DROP TYPE IF EXISTS public.order_type       CASCADE;
DROP TYPE IF EXISTS public.payment_method   CASCADE;

-- ============ SCHEMA ============
CREATE TYPE order_status    AS ENUM ('PENDING','PROCESSING','SHIPPED','DELIVERED');
CREATE TYPE order_type      AS ENUM ('pickup','delivery');
CREATE TYPE payment_method  AS ENUM ('online','cash','card');

CREATE TABLE public.users (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text UNIQUE,
  "password_hash" text,
  "phone_number" text,
  "last_login_at" timestamp,
  "deleted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX email_idx ON public.users (email);
CREATE UNIQUE INDEX phone_number_unique_idx ON public.users (phone_number) WHERE phone_number IS NOT NULL;

CREATE TABLE public.roles (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text
);

CREATE TABLE public.user_roles (
  "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "role_id" integer NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE
);

CREATE TABLE public.addresses (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "address" text NOT NULL,
  "notes" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX addresses_user_id_idx ON public.addresses (user_id);

CREATE TABLE public.ingredients (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "unit" text NOT NULL,
  "price" numeric(10,2) NOT NULL,
  "is_available" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "description" text,
  "price" numeric(10,2) NOT NULL,
  "image_url" text,
  "available" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.product_ingredients (
  "product_id" integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  "ingredient_id" integer NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE
);
CREATE INDEX product_ingredients_product_id_ingredient_id_index
  ON public.product_ingredients (product_id, ingredient_id);

CREATE TABLE public.orders (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "total" numeric(10,2) NOT NULL,
  "status" order_status NOT NULL DEFAULT 'PENDING',
  "order_type" order_type NOT NULL DEFAULT 'pickup',
  "payment_method" payment_method NOT NULL DEFAULT 'online',
  -- Immutable contact snapshot: the person's details may change later,
  -- but an order must preserve who it belonged to when placed.
  "contact_name" text NOT NULL DEFAULT '',
  "contact_phone" text NOT NULL DEFAULT '',
  "delivery_address" text NOT NULL DEFAULT '',
  "delivery_notes" text NOT NULL DEFAULT '',
  "tracking_code" text UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX user_id_idx    ON public.orders (user_id);
CREATE INDEX created_at_idx ON public.orders (created_at);

CREATE TABLE public.order_item (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  "product_id" integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  "quantity" integer NOT NULL
);

CREATE TABLE public.order_status_history (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  "status" order_status NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.password_reset_tokens (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL
);

CREATE TABLE public.inventory (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ingredient_id" integer NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  "quantity" integer NOT NULL DEFAULT 0,
  "min_threshold" integer NOT NULL DEFAULT 10,
  "unit" text NOT NULL DEFAULT 'pieces',
  "last_updated" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX inventory_ingredient_id_idx ON public.inventory (ingredient_id);
CREATE INDEX inventory_quantity_idx      ON public.inventory (quantity);

CREATE TABLE public.inventory_movements (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "inventory_id" uuid NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  "type" text NOT NULL CHECK ("type" IN ('in','out','adjustment','order')),
  "quantity" integer NOT NULL,
  "reason" text,
  "reference_id" text,
  "created_by" uuid REFERENCES public.users(id),
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX inventory_movements_inventory_id_idx ON public.inventory_movements (inventory_id);
CREATE INDEX inventory_movements_type_idx         ON public.inventory_movements (type);
CREATE INDEX inventory_movements_created_at_idx   ON public.inventory_movements (created_at);

CREATE TABLE public.inventory_alerts (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "inventory_id" uuid NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  "type" text NOT NULL,
  "message" text NOT NULL,
  "is_resolved" boolean NOT NULL DEFAULT false,
  "resolved_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX inventory_alerts_inventory_id_idx ON public.inventory_alerts (inventory_id);
CREATE INDEX inventory_alerts_type_idx         ON public.inventory_alerts (type);
CREATE INDEX inventory_alerts_resolved_idx     ON public.inventory_alerts (is_resolved);

COMMIT;
