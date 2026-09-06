-- ─── Clean Existing Schema ───
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.activity_logs cascade;
drop table if exists public.blog_posts cascade;
drop table if exists public.team_members cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.website_settings cascade;
drop table if exists public.services cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.profiles cascade;

-- ─── Profiles Table (Linked to auth.users) ───
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('super_admin', 'admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- ─── Contact Messages Table ───
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on contact_messages
alter table public.contact_messages enable row level security;

-- ─── Services Table ───
create table public.services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  icon text not null,
  short_description text not null,
  overview text not null,
  benefits text[] not null default '{}',
  process_steps jsonb not null default '[]',
  faqs jsonb not null default '[]',
  is_active boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on services
alter table public.services enable row level security;

-- ─── Website Settings Table ───
create table public.website_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text not null,
  category text not null check (category in ('general', 'contact', 'seo', 'social')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on website_settings
alter table public.website_settings enable row level security;

-- ─── Testimonials Table ───
create table public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text not null,
  role text not null,
  content text not null,
  avatar_url text,
  rating integer default 5 not null check (rating >= 1 and rating <= 5),
  is_active boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on testimonials
alter table public.testimonials enable row level security;

-- ─── Team Members Table ───
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  bio text not null,
  avatar_url text,
  linkedin_url text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on team_members
alter table public.team_members enable row level security;

-- ─── Blog Posts Table ───
create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image text,
  author_id uuid references public.profiles(id) on delete set null,
  is_published boolean default false not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on blog_posts
alter table public.blog_posts enable row level security;

-- ─── Activity Logs Table ───
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on activity_logs
alter table public.activity_logs enable row level security;


-- ─── Trigger Function to Handle New User Profile Creation ───
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    new.email,
    'user',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Row Level Security (RLS) Policies ───

-- Helper function to check if the current user is an admin or super_admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
end;
$$ language plpgsql security definer;

-- 1. Profiles Policies
create policy "Allow public read on profiles" on public.profiles
  for select using (true);

create policy "Allow owners to update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow admin full CRUD on profiles" on public.profiles
  for all using (public.is_admin());

-- 2. Contact Messages Policies
create policy "Allow anonymous submission of contact messages" on public.contact_messages
  for insert with check (true);

create policy "Allow admin access to contact messages" on public.contact_messages
  for all using (public.is_admin());

-- 3. Services Policies
create policy "Allow public read on active services" on public.services
  for select using (is_active = true);

create policy "Allow admin full access to services" on public.services
  for all using (public.is_admin());

-- 4. Website Settings Policies
create policy "Allow public read on settings" on public.website_settings
  for select using (true);

create policy "Allow admin full access to settings" on public.website_settings
  for all using (public.is_admin());

-- 5. Testimonials Policies
create policy "Allow public read on active testimonials" on public.testimonials
  for select using (is_active = true);

create policy "Allow admin full access to testimonials" on public.testimonials
  for all using (public.is_admin());

-- 6. Team Members Policies
create policy "Allow public read on active team members" on public.team_members
  for select using (is_active = true);

create policy "Allow admin full access to team members" on public.team_members
  for all using (public.is_admin());

-- 7. Blog Posts Policies
create policy "Allow public read on published blog posts" on public.blog_posts
  for select using (is_published = true);

create policy "Allow admin full access to blog posts" on public.blog_posts
  for all using (public.is_admin());

-- 8. Activity Logs Policies
create policy "Allow user insert own log" on public.activity_logs
  for insert with check (auth.uid() = user_id);

create policy "Allow admin full access to logs" on public.activity_logs
  for select using (public.is_admin());


-- ─── Refresh Tokens Table (Optional — for server-side token revocation) ───────
-- Stores hashed refresh tokens for auditing and forced revocation (e.g. logout all devices).
-- If you prefer stateless refresh tokens, this table can be omitted.
create table if not exists public.refresh_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  token_hash text not null unique,  -- Store a SHA-256 hash of the token, not the token itself
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  revoked_at timestamp with time zone  -- NULL = active; set to revoke
);

-- Index for fast token lookups
create index if not exists refresh_tokens_token_hash_idx on public.refresh_tokens (token_hash);
create index if not exists refresh_tokens_user_id_idx on public.refresh_tokens (user_id);

-- Enable RLS on refresh_tokens
alter table public.refresh_tokens enable row level security;

-- Policies
create policy "Allow user to manage own refresh tokens" on public.refresh_tokens
  for all using (auth.uid() = user_id);

create policy "Allow admin full access to refresh tokens" on public.refresh_tokens
  for all using (public.is_admin());
