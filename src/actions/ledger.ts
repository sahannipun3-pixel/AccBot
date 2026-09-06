"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { ledgerAccountSchema, ledgerTransactionSchema } from "@/lib/validators";
import type { LedgerAccount, LedgerTransaction, JournalEntry, TrialBalanceRow } from "@/types";
import { revalidatePath } from "next/cache";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function getAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthenticated.");
  }
  return user;
}

// ─── Get Chart of Accounts ───────────────────────────────────────────────────
export async function getAccounts(): Promise<LedgerAccount[]> {
  try {
    return await sql<LedgerAccount[]>`
      SELECT id, code, name, type, currency, is_active, created_at
      FROM accounts
      WHERE is_active = true
      ORDER BY code ASC
    `;
  } catch (err) {
    console.error("[ledger] getAccounts error:", err);
    return [];
  }
}

// ─── Create Ledger Account (Admin Only) ──────────────────────────────────────
export async function createAccount(formData: unknown) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin" && user.role !== "super_admin") {
      return { success: false, error: "Access denied. Administrators only." };
    }

    const result = ledgerAccountSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, error: result.error.flatten().fieldErrors };
    }

    const { code, name, type, currency, is_active } = result.data;

    // Check code uniqueness
    const existing = await sql<{ id: string }[]>`
      SELECT id FROM accounts WHERE code = ${code.trim()} LIMIT 1
    `;
    if (existing.length > 0) {
      return { success: false, error: { code: ["Account code already exists."] } };
    }

    await sql`
      INSERT INTO accounts (code, name, type, currency, is_active)
      VALUES (${code.trim()}, ${name.trim()}, ${type}, ${currency}, ${is_active})
    `;

    revalidatePath("/accounts-web");
    return { success: true };
  } catch (err) {
    console.error("[ledger] createAccount error:", err);
    return { success: false, error: (err as Error).message || "Failed to create ledger account." };
  }
}

// ─── Create Double-Entry Transaction (Atomic Journal Insertion) ──────────────
export async function createLedgerTransaction(formData: unknown) {
  try {
    const user = await getAuthenticatedUser();

    const result = ledgerTransactionSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, error: result.error.flatten().fieldErrors };
    }

    const { reference_number, description, transaction_date, entries } = result.data;

    // Perform verification: Debits must equal Credits
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return { success: false, error: "Transaction is unbalanced. Debits must equal Credits." };
    }

    // Execute atomic insertion block
    await sql.begin(async (tx) => {
      // 1. Insert header transaction
      const [txHeader] = await tx<{ id: string }[]>`
        INSERT INTO transactions (reference_number, description, transaction_date, created_by)
        VALUES (${reference_number.trim()}, ${description.trim()}, ${transaction_date}, ${user.id})
        RETURNING id
      `;

      // 2. Insert journal splits
      for (const entry of entries) {
        await tx`
          INSERT INTO journal_entries (transaction_id, account_id, debit, credit, description)
          VALUES (${txHeader.id}, ${entry.account_id}, ${entry.debit}, ${entry.credit}, ${entry.description || null})
        `;
      }
    });

    revalidatePath("/accounts-web");
    return { success: true };
  } catch (err) {
    console.error("[ledger] createLedgerTransaction error:", err);
    return { success: false, error: (err as Error).message || "Failed to post ledger transaction." };
  }
}

// ─── Get Trial Balance Report ────────────────────────────────────────────────
export async function getTrialBalanceReport(): Promise<TrialBalanceRow[]> {
  try {
    return await sql<TrialBalanceRow[]>`
      SELECT account_id, code, name, type, 
             total_debit::float as total_debit, 
             total_credit::float as total_credit, 
             net_balance::float as net_balance
      FROM trial_balance
      ORDER BY code ASC
    `;
  } catch (err) {
    console.error("[ledger] getTrialBalanceReport error:", err);
    return [];
  }
}

// ─── Get Profit & Loss Statement ─────────────────────────────────────────────
export interface ProfitAndLossReport {
  revenues: { code: string; name: string; balance: number }[];
  expenses: { code: string; name: string; balance: number }[];
  totalRevenues: number;
  totalExpenses: number;
  netProfitLoss: number;
}

export async function getProfitAndLossReport(): Promise<ProfitAndLossReport> {
  try {
    const trialBalance = await getTrialBalanceReport();

    const revenues: { code: string; name: string; balance: number }[] = [];
    const expenses: { code: string; name: string; balance: number }[] = [];
    let totalRevenues = 0;
    let totalExpenses = 0;

    for (const row of trialBalance) {
      if (row.type === "revenue") {
        // Revenues normally have credit balance (credit - debit)
        const balance = row.total_credit - row.total_debit;
        revenues.push({ code: row.code, name: row.name, balance });
        totalRevenues += balance;
      } else if (row.type === "expense") {
        // Expenses normally have debit balance (debit - credit)
        const balance = row.total_debit - row.total_credit;
        expenses.push({ code: row.code, name: row.name, balance });
        totalExpenses += balance;
      }
    }

    return {
      revenues,
      expenses,
      totalRevenues,
      totalExpenses,
      netProfitLoss: totalRevenues - totalExpenses,
    };
  } catch (err) {
    console.error("[ledger] getProfitAndLossReport error:", err);
    return {
      revenues: [],
      expenses: [],
      totalRevenues: 0,
      totalExpenses: 0,
      netProfitLoss: 0,
    };
  }
}

// ─── Get Balance Sheet Report ────────────────────────────────────────────────
export interface BalanceSheetReport {
  assets: { code: string; name: string; balance: number }[];
  liabilities: { code: string; name: string; balance: number }[];
  equity: { code: string; name: string; balance: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netIncomeRetained: number;
}

export async function getBalanceSheetReport(): Promise<BalanceSheetReport> {
  try {
    const trialBalance = await getTrialBalanceReport();
    const plReport = await getProfitAndLossReport();

    const assets: { code: string; name: string; balance: number }[] = [];
    const liabilities: { code: string; name: string; balance: number }[] = [];
    const equity: { code: string; name: string; balance: number }[] = [];
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    for (const row of trialBalance) {
      if (row.type === "asset") {
        // Assets have debit balance
        const balance = row.total_debit - row.total_credit;
        assets.push({ code: row.code, name: row.name, balance });
        totalAssets += balance;
      } else if (row.type === "liability") {
        // Liabilities have credit balance
        const balance = row.total_credit - row.total_debit;
        liabilities.push({ code: row.code, name: row.name, balance });
        totalLiabilities += balance;
      } else if (row.type === "equity") {
        // Capital accounts have credit balance
        const balance = row.total_credit - row.total_debit;
        equity.push({ code: row.code, name: row.name, balance });
        totalEquity += balance;
      }
    }

    // Include the dynamic Net Profit/Loss calculated from Income Statement in retained earnings/equity
    totalEquity += plReport.netProfitLoss;

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      netIncomeRetained: plReport.netProfitLoss,
    };
  } catch (err) {
    console.error("[ledger] getBalanceSheetReport error:", err);
    return {
      assets: [],
      liabilities: [],
      equity: [],
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      netIncomeRetained: 0,
    };
  }
}
