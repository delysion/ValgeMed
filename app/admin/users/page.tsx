import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db/admin";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UserRow } from "./user-row";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const allProfiles = await db.query.profiles.findMany({
    orderBy: (profiles, { asc }) => [asc(profiles.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-1">User Approval</h1>
      <p className="text-sm text-text-secondary mb-6">
        Manage who can access the app. Logged in as <strong>{admin.email}</strong>
      </p>

      <div className="space-y-3">
        {allProfiles.length === 0 && (
          <p className="text-sm text-text-muted">No users yet.</p>
        )}
        {allProfiles.map((profile) => (
          <UserRow key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}