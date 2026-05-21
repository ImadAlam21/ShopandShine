-- ============================================================
-- Shop & Shine — Supabase schema, security & functions
-- Run this once in the Supabase SQL Editor (Dashboard → SQL).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- ============================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";      -- case-insensitive text

-- ---------- shared trigger: keep updated_at fresh ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ============================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       citext unique,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check used by RLS (SECURITY DEFINER avoids recursive policy lookups).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        citext not null unique,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             citext not null unique,
  description      text,
  price            numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  category_id      uuid references public.categories(id) on delete set null,
  stock            int not null default 0 check (stock >= 0),
  sku              text unique,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  is_new           boolean not null default false,
  tags             text[] not null default '{}',
  metadata         jsonb not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_products_tags on public.products using gin (tags);

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================
-- PRODUCT IMAGES (multiple per product)
-- ============================================================
create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text     text,
  position     int not null default 0,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists idx_product_images_product
  on public.product_images (product_id, position);
-- At most one primary image per product.
create unique index if not exists uniq_primary_image
  on public.product_images (product_id) where is_primary;

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique
                      default ('SS-' || to_char(now(),'YYYYMMDD') || '-' ||
                               upper(substr(gen_random_uuid()::text,1,6))),
  profile_id          uuid references public.profiles(id) on delete set null,
  email               citext not null,
  phone               text,
  shipping_name       text,
  shipping_address    jsonb,
  subtotal_paise      bigint not null default 0,
  shipping_paise      bigint not null default 0,
  total_paise         bigint not null,
  currency            text not null default 'INR',
  status              text not null default 'pending'
                      check (status in ('pending','paid','failed','fulfilled','cancelled','refunded')),
  razorpay_order_id   text unique,
  razorpay_payment_id text,
  razorpay_signature  text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_orders_profile on public.orders (profile_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_rzp on public.orders (razorpay_order_id);

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- ORDER ITEMS (snapshot, survives product edits)
-- ============================================================
create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  product_name     text not null,
  unit_price_paise bigint not null,
  quantity         int not null check (quantity > 0),
  line_total_paise bigint not null,
  created_at       timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items (order_id);

-- Atomic stock decrement when an order is paid.
create or replace function public.fulfill_order_stock(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.products p
  set stock = greatest(0, p.stock - oi.quantity)
  from public.order_items oi
  where oi.order_id = p_order_id and oi.product_id = p.id;
end; $$;

-- ============================================================
-- FORM SUBMISSIONS
-- ============================================================
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      citext not null,
  phone      text,
  subject    text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         citext not null unique,
  is_subscribed boolean not null default true,
  source        text,
  created_at    timestamptz not null default now()
);

create table if not exists public.bespoke_inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      citext not null,
  phone      text,
  budget     text,
  occasion   text,
  details    text not null,
  status     text not null default 'new'
             check (status in ('new','contacted','in_progress','closed')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles               enable row level security;
alter table public.categories             enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.bespoke_inquiries      enable row level security;

-- PROFILES: a user sees/edits only their own row; admins see all.
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = 'customer'); -- users cannot self-promote

-- CATEGORIES & PRODUCTS: public reads active rows; admin full write.
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (is_active or public.is_admin());
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (is_active or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
  for select using (
    public.is_admin() or
    exists (select 1 from public.products p
            where p.id = product_id and p.is_active)
  );
drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_admin_write on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS: customer reads own; admin reads all. Writes happen via the
-- service-role key in server route handlers (bypasses RLS) — no client writes.
drop policy if exists orders_owner_select on public.orders;
create policy orders_owner_select on public.orders
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists order_items_owner_select on public.order_items;
create policy order_items_owner_select on public.order_items
  for select using (
    public.is_admin() or
    exists (select 1 from public.orders o
            where o.id = order_id and o.profile_id = auth.uid())
  );

-- FORM TABLES: anyone can submit (insert); only admin can read.
drop policy if exists contact_insert_any on public.contact_messages;
create policy contact_insert_any on public.contact_messages
  for insert with check (true);
drop policy if exists contact_admin_read on public.contact_messages;
create policy contact_admin_read on public.contact_messages
  for select using (public.is_admin());

drop policy if exists newsletter_insert_any on public.newsletter_subscribers;
create policy newsletter_insert_any on public.newsletter_subscribers
  for insert with check (true);
drop policy if exists newsletter_update_any on public.newsletter_subscribers;
create policy newsletter_update_any on public.newsletter_subscribers
  for update using (true) with check (true); -- allows upsert on email conflict
drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select using (public.is_admin());

drop policy if exists bespoke_insert_any on public.bespoke_inquiries;
create policy bespoke_insert_any on public.bespoke_inquiries
  for insert with check (true);
drop policy if exists bespoke_admin_all on public.bespoke_inquiries;
create policy bespoke_admin_all on public.bespoke_inquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- STORAGE: product image bucket
-- A PUBLIC bucket serves images without any read policy, and uploads happen
-- server-side via the service-role key (which bypasses RLS), so NO storage
-- policies are needed here. (Creating policies on storage.objects from the SQL
-- editor often fails with "must be owner of table objects" — so we don't.)
--
-- If the INSERT below errors on permissions, skip it and instead create a
-- bucket named "jewelry-assets" with "Public bucket" ENABLED in
-- Dashboard -> Storage -> New bucket.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('jewelry-assets', 'jewelry-assets', true)
on conflict (id) do nothing;

-- ============================================================
-- DONE. Next steps:
--   1) Sign in to the site once with your Google account.
--   2) Make yourself admin (replace the email):
--        update public.profiles set role = 'admin'
--        where email = 'you@example.com';
--   3) (Optional) Load sample data: run supabase/seed.sql
-- ============================================================
