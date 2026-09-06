import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAccounts, getTrialBalanceReport, getProfitAndLossReport, getBalanceSheetReport } from "@/actions/ledger";
import AccountsWebClient from "./_client";

export const dynamic = "force-dynamic";

// ─── Server Component — Load Authenticated User & Accounting Reports ───────────
export default async function AccountsWebPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/accounts-web");
  }

  // Load ledger details and report compilations
  const [accounts, trialBalance, plReport, bsReport] = await Promise.all([
    getAccounts(),
    getTrialBalanceReport(),
    getProfitAndLossReport(),
    getBalanceSheetReport(),
  ]);

  return (
    <AccountsWebClient
      user={user}
      accounts={accounts}
      trialBalance={trialBalance}
      plReport={plReport}
      bsReport={bsReport}
    />
  );
}
