-- ═══════════════════════════════════════════════════════════════
-- AccBot — Database Schema v2
-- Custom Authentication (no auth.users dependency)
-- Run this against your Supabase PostgreSQL instance.
-- WARNING: This drops all existing tables. Back up data first.
-- ═══════════════════════════════════════════════════════════════

-- ─── Drop Old Schema (clean slate) ───────────────────────────────────────────

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.blog_posts cascade;
drop table if exists public.team_members cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.website_settings cascade;
drop table if exists public.services cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.refresh_tokens cascade;
drop table if exists public.password_reset_tokens cascade;
drop table if exists public.profiles cascade;
drop table if exists public.users cascade;


-- ─── Users Table (Custom Auth — No auth.users dependency) ────────────────────

create table public.users (
  id              uuid default gen_random_uuid() primary key,
  full_name       text not null,
  email           text not null unique,
  password_hash   text not null,
  phone           text,
  avatar_url      text,
  role            text not null default 'user' check (role in ('super_admin', 'admin', 'user')),
  is_active       boolean not null default true,
  created_at      timestamp with time zone default timezone('utc', now()) not null,
  updated_at      timestamp with time zone default timezone('utc', now()) not null
);

create index users_email_idx on public.users (email);
create index users_role_idx  on public.users (role);


-- ─── Password Reset Tokens ─────────────────────────────────────────────────

create table public.password_reset_tokens (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.users(id) on delete cascade not null,
  token_hash text not null unique,
  expires_at timestamp with time zone not null,
  used_at    timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create index prt_user_id_idx   on public.password_reset_tokens (user_id);
create index prt_token_hash_idx on public.password_reset_tokens (token_hash);


-- ─── Refresh Tokens ────────────────────────────────────────────────────────

create table public.refresh_tokens (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.users(id) on delete cascade not null,
  token_hash  text not null unique,
  expires_at  timestamp with time zone not null,
  revoked_at  timestamp with time zone,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

create index rt_user_id_idx   on public.refresh_tokens (user_id);
create index rt_token_hash_idx on public.refresh_tokens (token_hash);


-- ─── Contact Messages ─────────────────────────────────────────────────────

create table public.contact_messages (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  email      text not null,
  phone      text,
  subject    text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create index cm_created_at_idx on public.contact_messages (created_at desc);
create index cm_is_read_idx    on public.contact_messages (is_read);


-- ─── Services ─────────────────────────────────────────────────────────────

create table public.services (
  id                uuid default gen_random_uuid() primary key,
  title             text not null,
  slug              text not null unique,
  icon              text not null,
  short_description text not null,
  overview          text not null,
  benefits          text[] not null default '{}',
  process_steps     jsonb not null default '[]',
  faqs              jsonb not null default '[]',
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamp with time zone default timezone('utc', now()) not null,
  updated_at        timestamp with time zone default timezone('utc', now()) not null
);

create index services_slug_idx      on public.services (slug);
create index services_is_active_idx on public.services (is_active);
create index services_sort_idx      on public.services (sort_order);


-- ─── Website Settings ─────────────────────────────────────────────────────

create table public.website_settings (
  id         uuid default gen_random_uuid() primary key,
  key        text not null unique,
  value      text not null,
  category   text not null check (category in ('general', 'contact', 'seo', 'social')),
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

create index ws_category_idx on public.website_settings (category);


-- ─── Testimonials ─────────────────────────────────────────────────────────

create table public.testimonials (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  company    text not null,
  role       text not null,
  content    text not null,
  avatar_url text,
  rating     integer not null default 5 check (rating >= 1 and rating <= 5),
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc', now()) not null
);


-- ─── Team Members ─────────────────────────────────────────────────────────

create table public.team_members (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  role         text not null,
  bio          text not null,
  avatar_url   text,
  linkedin_url text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamp with time zone default timezone('utc', now()) not null
);


-- ─── Blog Posts ───────────────────────────────────────────────────────────

create table public.blog_posts (
  id           uuid default gen_random_uuid() primary key,
  title        text not null,
  slug         text not null unique,
  excerpt      text not null,
  content      text not null,
  cover_image  text,
  author_id    uuid references public.users(id) on delete set null,
  is_published boolean not null default false,
  published_at timestamp with time zone,
  created_at   timestamp with time zone default timezone('utc', now()) not null,
  updated_at   timestamp with time zone default timezone('utc', now()) not null
);

create index bp_slug_idx         on public.blog_posts (slug);
create index bp_is_published_idx on public.blog_posts (is_published);
create index bp_published_at_idx on public.blog_posts (published_at desc);


-- ─── Activity Logs ────────────────────────────────────────────────────────

create table public.activity_logs (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.users(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  metadata    jsonb default '{}'::jsonb,
  ip_address  text,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

create index al_user_id_idx    on public.activity_logs (user_id);
create index al_created_at_idx on public.activity_logs (created_at desc);


-- ─── Updated_at Auto-update Trigger ──────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();


-- ─── Seed: Default Website Settings ──────────────────────────────────────

insert into public.website_settings (key, value, category) values
  ('company_name',        'Accbot',                                                                                      'general'),
  ('tagline',             'Smart Accounting. Trusted Advisory.',                                                         'general'),
  ('description',         'We provide premium accounting, bookkeeping, and advisory services that empower businesses to grow with confidence.',  'general'),
  ('email',               'info@accbot.com',                                                                             'contact'),
  ('phone',               '+971 XX XXX XXXX',                                                                            'contact'),
  ('address',             'Business Bay, Dubai, UAE',                                                                    'contact'),
  ('whatsapp',            '+971XXXXXXXXX',                                                                               'contact'),
  ('meta_title',          'Accbot | Premium Accounting & Bookkeeping Services',                                          'seo'),
  ('meta_description',    'FTA compliant tax agents, bookkeeping, payroll management, audit assurance, and company registration in Dubai, UAE.', 'seo'),
  ('linkedin_url',        '#',                                                                                           'social'),
  ('twitter_url',         '#',                                                                                           'social'),
  ('facebook_url',        '#',                                                                                           'social'),
  ('instagram_url',       '#',                                                                                           'social')
on conflict (key) do nothing;


-- ═══════════════════════════════════════════════════════════════
-- SEED ADMIN USER
-- After running this script, the super_admin credentials are:
--   Email:    admin@accbot.com
--   Password: Admin@Accbot2024!
--
-- This hash was generated with bcrypt rounds=12.
-- CHANGE THIS PASSWORD IMMEDIATELY after first login.
-- To generate a new hash: node -e "const b=require('bcryptjs'); b.hash('YourNewPassword',12).then(console.log)"
-- ═══════════════════════════════════════════════════════════════

-- NOTE: The password hash below is a placeholder.
-- Run the following Node.js script ONCE to create the admin user properly:
--
--   node scripts/create-admin.js
--
-- Or use the /api/auth/setup-admin endpoint (only works when no super_admin exists).
