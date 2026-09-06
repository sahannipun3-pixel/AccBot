-- ═══════════════════════════════════════════════════════════════
-- AccBot — Database Schema v3 (Extensions)
-- Adds Expense Tracker and Accounts Web Ledger tables
-- ═══════════════════════════════════════════════════════════════

-- ─── Expense Categories Table ────────────────────────────────────────────────
create table if not exists public.expense_categories (
  id           uuid default gen_random_uuid() primary key,
  name         text not null unique,
  description  text,
  budget_limit numeric(12, 2) not null default 0.00,
  is_active    boolean default true not null,
  created_at   timestamp with time zone default timezone('utc', now()) not null
);

-- ─── Expenses Table ──────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.users(id) on delete set null,
  category_id      uuid references public.expense_categories(id) on delete restrict,
  amount           numeric(12, 2) not null check (amount > 0),
  currency         text not null default 'AED',
  description      text not null,
  receipt_url      text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  transaction_date date not null default current_date,
  approved_by      uuid references public.users(id) on delete set null,
  approved_at      timestamp with time zone,
  created_at       timestamp with time zone default timezone('utc', now()) not null
);

-- ─── Accounts Table (Chart of Accounts) ──────────────────────────────────────
create table if not exists public.accounts (
  id         uuid default gen_random_uuid() primary key,
  code       text not null unique,
  name       text not null,
  type       text not null check (type in ('asset', 'liability', 'equity', 'revenue', 'expense')),
  currency   text not null default 'AED',
  is_active  boolean default true not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- ─── Transactions Table (Financial Journal Header) ───────────────────────────
create table if not exists public.transactions (
  id               uuid default gen_random_uuid() primary key,
  reference_number text not null unique,
  description      text not null,
  transaction_date date not null default current_date,
  created_by       uuid references public.users(id) on delete set null,
  created_at       timestamp with time zone default timezone('utc', now()) not null
);

-- ─── Journal Entries Table (Double-Entry Splits) ─────────────────────────────
create table if not exists public.journal_entries (
  id             uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions(id) on delete cascade not null,
  account_id     uuid references public.accounts(id) on delete restrict not null,
  debit          numeric(12, 2) not null default 0.00 check (debit >= 0),
  credit         numeric(12, 2) not null default 0.00 check (credit >= 0),
  description    text,
  created_at     timestamp with time zone default timezone('utc', now()) not null,
  constraint chk_debit_credit_values check (
    (debit > 0 and credit = 0) or (debit = 0 and credit > 0)
  )
);

-- ─── Indexes for Performance Optimization ────────────────────────────────────
create index if not exists idx_expenses_user_date on public.expenses (user_id, transaction_date desc);
create index if not exists idx_expenses_category on public.expenses (category_id);
create index if not exists idx_expenses_status on public.expenses (status);

create index if not exists idx_accounts_type on public.accounts (type);
create index if not exists idx_journal_entries_transaction on public.journal_entries (transaction_id);
create index if not exists idx_journal_entries_account on public.journal_entries (account_id);

-- ─── Trial Balance View ──────────────────────────────────────────────────────
create or replace view public.trial_balance as
select 
  a.id as account_id,
  a.code, 
  a.name, 
  a.type, 
  coalesce(sum(j.debit), 0.00) as total_debit, 
  coalesce(sum(j.credit), 0.00) as total_credit, 
  (coalesce(sum(j.debit), 0.00) - coalesce(sum(j.credit), 0.00)) as net_balance 
from public.accounts a 
left join public.journal_entries j on a.id = j.account_id
group by a.id, a.code, a.name, a.type;

-- ─── Enable Row Level Security (RLS) ─────────────────────────────────────────
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.journal_entries enable row level security;

-- ─── Row Level Security (RLS) Policies ───────────────────────────────────────

-- Helper role checker helper
create or replace function public.is_admin_v2(user_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = user_uuid and role in ('admin', 'super_admin')
  );
end;
$$ language plpgsql security definer;

-- 1. Expense Categories Policies
create policy "Allow read on active categories" on public.expense_categories
  for select using (is_active = true);

create policy "Allow admin CRUD on categories" on public.expense_categories
  for all using (public.is_admin_v2(auth.uid()));

-- 2. Expenses Policies
create policy "Allow users to view own expenses" on public.expenses
  for select using (user_id = auth.uid() or public.is_admin_v2(auth.uid()));

create policy "Allow users to log own expenses" on public.expenses
  for insert with check (user_id = auth.uid());

create policy "Allow users to edit pending own expenses" on public.expenses
  for update using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'pending');

create policy "Allow admin full access to review expenses" on public.expenses
  for all using (public.is_admin_v2(auth.uid()));

-- 3. Accounts Policies
create policy "Allow read on accounts" on public.accounts
  for select using (is_active = true or public.is_admin_v2(auth.uid()));

create policy "Allow admin full access to accounts" on public.accounts
  for all using (public.is_admin_v2(auth.uid()));

-- 4. Transactions Policies
create policy "Allow users to view transactions" on public.transactions
  for select using (created_by = auth.uid() or public.is_admin_v2(auth.uid()));

create policy "Allow users to create transactions" on public.transactions
  for insert with check (created_by = auth.uid());

create policy "Allow admin full access to transactions" on public.transactions
  for all using (public.is_admin_v2(auth.uid()));

-- 5. Journal Entries Policies
create policy "Allow users to view journal entries" on public.journal_entries
  for select using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id 
        and (t.created_by = auth.uid() or public.is_admin_v2(auth.uid()))
    )
  );

create policy "Allow users to create journal entries" on public.journal_entries
  for insert with check (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id and t.created_by = auth.uid()
    )
  );

create policy "Allow admin full access to journal entries" on public.journal_entries
  for all using (public.is_admin_v2(auth.uid()));
