import { getAllTeamMembers } from "@/actions/team";
import type { TeamMember } from "@/types";
import AdminTeamClient from "./_client";

export default async function AdminTeamPage() {
  let members: TeamMember[] = [];
  try {
    members = await getAllTeamMembers();
  } catch (err) {
    console.error("Failed to fetch team members", err);
  }
  return <AdminTeamClient initialMembers={members} />;
}
