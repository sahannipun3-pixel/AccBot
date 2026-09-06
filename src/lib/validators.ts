import { z } from "zod";

// ─── Contact Form Validator ───
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ─── Auth Validators ───
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Profile Update Validator ───
export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address"), // usually disabled from editing directly or verified
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ─── Admin Content Validators ───
export const serviceProcessStepSchema = z.object({
  step: z.number().int().default(1),
  title: z.string().min(2, "Step title is required"),
  description: z.string().min(5, "Step description is required"),
});

export const serviceFAQSchema = z.object({
  question: z.string().min(3, "Question is required"),
  answer: z.string().min(5, "Answer is required"),
});

export const serviceSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  icon: z.string().min(1, "Icon name is required"),
  short_description: z.string().min(10, "Short description must be at least 10 characters"),
  overview: z.string().min(20, "Overview must be at least 20 characters"),
  benefits: z.array(z.string()).default([]),
  process_steps: z.array(serviceProcessStepSchema).default([]),
  faqs: z.array(serviceFAQSchema).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export const testimonialSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company is required"),
  role: z.string().min(2, "Role is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  rating: z.number().min(1).max(5),
  is_active: z.boolean(),
  sort_order: z.number().int(),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

// ─── Blog Post Validator ───
export const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(300, "Excerpt too long"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  cover_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_published: z.boolean(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

// ─── Team Member Validator ───
export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(2, "Role/Position is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sort_order: z.number().int(),
  is_active: z.boolean(),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

// ─── Expense Tracker Validators ───
export const expenseCategorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100),
  description: z.string().optional().or(z.literal("")),
  budget_limit: z.number().min(0, "Budget limit must be non-negative").default(0),
  is_active: z.boolean().default(true),
});

export type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>;

export const expenseSchema = z.object({
  category_id: z.string().uuid("Invalid category selection"),
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().min(3).max(3),
  description: z.string().min(3, "Description must be at least 3 characters").max(500),
  receipt_url: z.string().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// ─── Accounts Web Ledger Validators ───
export const ledgerAccountSchema = z.object({
  code: z.string().min(2, "Account code is required").max(20),
  name: z.string().min(2, "Account name is required").max(100),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  currency: z.string().min(3).max(3).default("AED"),
  is_active: z.boolean().default(true),
});

export type LedgerAccountFormData = z.infer<typeof ledgerAccountSchema>;

export const journalEntrySchema = z.object({
  account_id: z.string().uuid("Invalid account selection"),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  description: z.string().optional().or(z.literal("")),
});

export const ledgerTransactionSchema = z.object({
  reference_number: z.string().min(2, "Reference number is required").max(50),
  description: z.string().min(3, "Description is required").max(500),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  entries: z.array(journalEntrySchema).min(2, "At least two split entries are required for a transaction"),
}).refine((data) => {
  const totalDebit = data.entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = data.entries.reduce((sum, e) => sum + e.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
}, {
  message: "Transaction is unbalanced: Total Debits must equal Total Credits.",
  path: ["entries"],
});

export type LedgerTransactionFormData = z.infer<typeof ledgerTransactionSchema>;


