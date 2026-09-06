import type { TeamMember } from "@/types";
import { getActiveTeamMembers } from "@/actions/team";
import { TeamClient } from "./team-client";

// ─── Server Component — loads active team members from DB for home page ─────────
export async function Team() {
  let team: TeamMember[] = [];
  try {
    team = await getActiveTeamMembers();
  } catch (err) {
    console.error("Failed to load team members from database:", err);
  }
  return <TeamClient team={team} />;
}
