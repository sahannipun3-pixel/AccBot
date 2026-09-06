/* ─── Database Entity Types ─── */

export type UserRole = "super_admin" | "admin" | "user";

/** Custom users table — no auth.users dependency */
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Alias kept for backward-compatibility in components that reference Profile */
export type Profile = User;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  icon: string;
  short_description: string;
  overview: string;
  benefits: string[];
  process_steps: ProcessStep[];
  faqs: ServiceFAQ[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSetting {
  id: string;
  key: string;
  value: string;
  category: "general" | "contact" | "seo" | "social";
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  avatar_url: string | null;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  linkedin_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string; // Only fetched on single post views
  cover_image: string | null;
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
}

/* ─── UI Types ─── */

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStepUI {
  step: number;
  title: string;
  description: string;
  icon: string;
}

/* ─── Admin Dashboard Types ─── */

export interface DashboardStats {
  totalUsers: number;
  totalMessages: number;
  unreadMessages: number;
  activeServices: number;
}

/* ─── Expense Tracker Types ─── */
export interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  budget_limit: number;
  is_active: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string | null;
  category_id: string;
  amount: number;
  currency: string;
  description: string;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected";
  transaction_date: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  // Join fields
  category_name?: string;
  user_name?: string;
}

/* ─── Accounts Web Ledger Types ─── */
export type LedgerAccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: LedgerAccountType;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface LedgerTransaction {
  id: string;
  reference_number: string;
  description: string;
  transaction_date: string;
  created_by: string | null;
  created_at: string;
  // Joins
  entries?: JournalEntry[];
}

export interface JournalEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string | null;
  created_at: string;
  // Joins
  account_code?: string;
  account_name?: string;
  account_type?: LedgerAccountType;
}

export interface TrialBalanceRow {
  account_id: string;
  code: string;
  name: string;
  type: LedgerAccountType;
  total_debit: number;
  total_credit: number;
  net_balance: number;
}

