-- ============================================================
-- dev-seed-minimal · FastFood minimal representative seed
-- Requires the R1 schema (scripts/sql/dev-reset.sql).
-- Covers: admin/staff roles · registered civilian · record-only
-- person · address book · pickup/delivery × online/cash/card ·
-- contact snapshots · tracking codes · status history.
--
-- Dev/CI only. Apply via Neon SQL Editor or:
--   psql "$DB_URL" -f scripts/sql/dev-reset.sql
--   psql "$DB_URL" -f scripts/sql/dev-seed-minimal.sql
-- ============================================================

BEGIN;

INSERT INTO public.roles (id, name, description) VALUES
  (1,'admin','Administrator'),
  (2,'staff','Staff operations');
SELECT setval(pg_get_serial_sequence('roles','id'), 2);

INSERT INTO public.ingredients (name, unit, price) VALUES
  ('Meat','kg','2.0'),('Cheese','kg','1.2'),('Bread','loaves','1.5');

INSERT INTO public.products (name, description, price, image_url) VALUES
  ('Classic Burger','Juicy beef burger with lettuce and tomato','8.99',NULL),
  ('Cheese Burger','Beef burger with cheese','9.99',NULL),
  ('Fries','Crispy french fries','3.99',NULL),
  ('Pizza Margherita','Classic pizza','12.99',NULL),
  -- Caesar Salad @ 6.99 is part of the e2e journey contract
  -- (e2e/user-journey.spec.ts asserts totals built on it)
  ('Caesar Salad','Fresh salad with chicken and caesar dressing','6.99',NULL);

INSERT INTO public.product_ingredients VALUES
  (1,1),(1,2),(2,2),(4,2),(5,1),(5,3);
SELECT setval(pg_get_serial_sequence('products','id'),    (SELECT MAX(id) FROM public.products));
SELECT setval(pg_get_serial_sequence('ingredients','id'), (SELECT MAX(id) FROM public.ingredients));

-- bcrypt('P4$$W0rD') — same dev convention as the previous seeder.
-- Alice is a record-only person: no credentials until she registers
-- and claims her record via phone+name match.
INSERT INTO public.users (name, email, password_hash, phone_number) VALUES
  ('John Doe','john.doe@example.com','$2b$10$B1osmUvl5yfLAMPE8hD7vuSzqE/gQ8/ERjAymS6NAdK/JuvPAvpE6','5491111111111'),
  ('Bob Brown','bob.brown@example.com','$2b$10$B1osmUvl5yfLAMPE8hD7vuSzqE/gQ8/ERjAymS6NAdK/JuvPAvpE6','5491122222222'),
  ('Jane Smith','jane.smith@example.com','$2b$10$B1osmUvl5yfLAMPE8hD7vuSzqE/gQ8/ERjAymS6NAdK/JuvPAvpE6','5491133333333'),
  ('Alice Johnson','alice.johnson@example.com',NULL,'5491144444444');

INSERT INTO public.user_roles VALUES
  ((SELECT id FROM public.users WHERE email='john.doe@example.com'), 1),
  ((SELECT id FROM public.users WHERE email='bob.brown@example.com'), 2);

INSERT INTO public.addresses (user_id, address, notes) VALUES
  ((SELECT id FROM public.users WHERE email='jane.smith@example.com'),
   'Av. Siempre Viva 742, Buenos Aires',
   'Portón verde, tocar timbre 3');

INSERT INTO public.orders (user_id,total,status,order_type,payment_method,contact_name,contact_phone,tracking_code)
VALUES ((SELECT id FROM public.users WHERE email='jane.smith@example.com'),
        '24.97','PENDING','pickup','online','Jane Smith','5491133333333','BK7Q2M');

INSERT INTO public.orders (user_id,total,status,order_type,payment_method,contact_name,contact_phone,delivery_address,delivery_notes,tracking_code)
VALUES ((SELECT id FROM public.users WHERE email='alice.johnson@example.com'),
        '13.98','PROCESSING','delivery','cash','Alice Johnson','5491144444444',
        'Calle Falsa 123, Buenos Aires','Depto 2°B, dejar en portería','DX4K9T');

INSERT INTO public.orders (user_id,total,status,order_type,payment_method,contact_name,contact_phone,delivery_address,tracking_code)
VALUES ((SELECT id FROM public.users WHERE email='jane.smith@example.com'),
        '8.99','DELIVERED','delivery','card','Jane Smith','5491133333333',
        'Av. Siempre Viva 742, Buenos Aires','TR8Z1P');

INSERT INTO public.order_item (order_id, product_id, quantity)
SELECT o.id, p.id, v.qty
FROM (VALUES
  ('BK7Q2M',1,2),('BK7Q2M',3,1),
  ('DX4K9T',4,1),('DX4K9T',3,1),
  ('TR8Z1P',1,1)
) AS v(code,pid,qty)
JOIN public.orders o ON o.tracking_code = v.code
JOIN public.products p ON p.id = v.pid;

INSERT INTO public.order_status_history (order_id, status)
SELECT id,'PENDING' FROM public.orders WHERE tracking_code='BK7Q2M';

INSERT INTO public.order_status_history (order_id, status)
SELECT id,'PROCESSING' FROM public.orders WHERE tracking_code='DX4K9T';

INSERT INTO public.order_status_history (order_id, status)
SELECT id,'PENDING' FROM public.orders WHERE tracking_code='TR8Z1P';

INSERT INTO public.order_status_history (order_id, status)
SELECT id,'PROCESSING' FROM public.orders WHERE tracking_code='TR8Z1P';

INSERT INTO public.order_status_history (order_id, status)
SELECT id,'DELIVERED' FROM public.orders WHERE tracking_code='TR8Z1P';

INSERT INTO public.inventory (ingredient_id, quantity, min_threshold, unit) VALUES
  (1,25,5,'kg'),(2,20,5,'kg'),(3,60,10,'loaves');

COMMIT;
