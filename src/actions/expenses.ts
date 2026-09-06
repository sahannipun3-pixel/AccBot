"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { expenseSchema, expenseCategorySchema } from "@/lib/validators";
import type { Expense, ExpenseCategory } from "@/types";
import { revalidatePath } from "next/cache";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function getAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthenticated.");
  }
  return user;
}

// ─── Get Active Expense Categories ──────────────────────────────────────────
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    return await sql<ExpenseCategory[]>`
      SELECT id, name, description, budget_limit, is_active, created_at
      FROM expense_categories
      WHERE is_active = true
      ORDER BY name ASC
    `;
  } catch (err) {
    console.error("[expenses] getExpenseCategories error:", err);
    return [];
  }
}

// ─── Create Expense Category (Admin Only) ────────────────────────────────────
export async function createExpenseCategory(formData: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin" && user.role !== "super_admin") {
      return { success: false, error: "Access denied. Administrators only." };
    }

    const result = expenseCategorySchema.safeParse(formData);
    if (!result.success) {
      return { success: false, error: result.error.flatten().fieldErrors };
    }

    const { name, description, budget_limit, is_active } = result.data;

    await sql`
      INSERT INTO expense_categories (name, description, budget_limit, is_active)
      VALUES (${name.trim()}, ${description || null}, ${budget_limit}, ${is_active})
    `;

    revalidatePath("/expense-tracker");
    return { success: true };
  } catch (err) {
    console.error("[expenses] createExpenseCategory error:", err);
    return { success: false, error: (err as Error).message || "Failed to create category." };
  }
}

// ─── Get Expenses (User logs / Admin list) ───────────────────────────────────
interface GetExpensesOptions {
  status?: string;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getExpenses(options: GetExpensesOptions = {}): Promise<Expense[]> {
  try {
    const user = await getAuthenticatedUser();
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    const { status, categoryId, search, limit = 50, offset = 0 } = options;

    // Build parts of query programmatically but safely via postgres.js sql helpers
    const conditions = [];

    // Role guard: Non-admins can only see their own expenses
    if (!isAdmin) {
      conditions.push(sql`e.user_id = ${user.id}`);
    }

    if (status && status !== "all") {
      conditions.push(sql`e.status = ${status}`);
    }

    if (categoryId && categoryId !== "all") {
      conditions.push(sql`e.category_id = ${categoryId}`);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(sql`(e.description ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})`);
    }

    // Combine conditions
    const whereClause = conditions.length > 0 
      ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}` 
      : sql``;

    return await sql<Expense[]>`
      SELECT 
        e.id, 
        e.user_id, 
        e.category_id, 
        e.amount, 
        e.currency, 
        e.description, 
        e.receipt_url, 
        e.status, 
        e.transaction_date::text as transaction_date, 
        e.approved_by, 
        e.approved_at, 
        e.created_at,
        c.name as category_name,
        u.full_name as user_name
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      LEFT JOIN users u ON e.user_id = u.id
      ${whereClause}
      ORDER BY e.transaction_date DESC, e.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } catch (err) {
    console.error("[expenses] getExpenses error:", err);
    return [];
  }
}

// ─── Create Expense (User / Admin) ───────────────────────────────────────────
export async function createExpense(formData: unknown) {
  try {
    const user = await getAuthenticatedUser();

    const result = expenseSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, error: result.error.flatten().fieldErrors };
    }

    const { category_id, amount, currency, description, receipt_url, transaction_date } = result.data;

    await sql`
      INSERT INTO expenses (user_id, category_id, amount, currency, description, receipt_url, transaction_date, status)
      VALUES (${user.id}, ${category_id}, ${amount}, ${currency}, ${description.trim()}, ${receipt_url || null}, ${transaction_date}, 'pending')
    `;

    revalidatePath("/expense-tracker");
    return { success: true };
  } catch (err) {
    console.error("[expenses] createExpense error:", err);
    return { success: false, error: (err as Error).message || "Failed to create expense entry." };
  }
}

// ─── Approve Expense (Admin Only) ────────────────────────────────────────────
export async function approveExpense(expenseId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin" && user.role !== "super_admin") {
      return { success: false, error: "Access denied. Administrators only." };
    }

    await sql`
      UPDATE expenses
      SET 
        status = 'approved',
        approved_by = ${user.id},
        approved_at = NOW()
      WHERE id = ${expenseId}
    `;

    revalidatePath("/expense-tracker");
    return { success: true };
  } catch (err) {
    console.error("[expenses] approveExpense error:", err);
    return { success: false, error: (err as Error).message || "Failed to approve expense." };
  }
}

// ─── Reject Expense (Admin Only) ────────────────────────────────────────────
export async function rejectExpense(expenseId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin" && user.role !== "super_admin") {
      return { success: false, error: "Access denied. Administrators only." };
    }

    await sql`
      UPDATE expenses
      SET 
        status = 'rejected',
        approved_by = ${user.id},
        approved_at = NOW()
      WHERE id = ${expenseId}
    `;

    revalidatePath("/expense-tracker");
    return { success: true };
  } catch (err) {
    console.error("[expenses] rejectExpense error:", err);
    return { success: false, error: (err as Error).message || "Failed to reject expense." };
  }
}
