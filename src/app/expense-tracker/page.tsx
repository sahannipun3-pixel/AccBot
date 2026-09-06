import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getExpenseCategories, getExpenses } from "@/actions/expenses";
import ExpenseTrackerClient from "./_client";

export const dynamic = "force-dynamic";

// ─── Server Component — Load Authenticated User & Database Data ───────────────
export default async function ExpenseTrackerPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/expense-tracker");
  }

  // Load categories and initial expenses
  const [categories, initialExpenses] = await Promise.all([
    getExpenseCategories(),
    getExpenses(),
  ]);

  return (
    <ExpenseTrackerClient
      user={user}
      initialExpenses={initialExpenses}
      categories={categories}
    />
  );
}
