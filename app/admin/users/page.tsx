import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db/admin";
import { profiles } from "@/lib/db/schema";
import { UserRow } from "./user-row";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminUsersPage(props: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const admin = await requireAdmin();
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const allProfiles = await db.query.profiles.findMany({
    orderBy: (profiles, { asc }) => [asc(profiles.createdAt)],
  });

  const total = allProfiles.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paged = allProfiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-1">User Approval</h1>
      <p className="text-sm text-text-secondary mb-6">
        Manage who can access the app. Logged in as <strong>{admin.email}</strong>
      </p>

      <div className="space-y-3 mb-6">
        {total === 0 && (
          <p className="text-sm text-text-muted">No users yet.</p>
        )}
        {paged.map((profile) => (
          <UserRow key={profile.id} profile={profile} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={`/admin/users?page=${page - 1}`}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-text-secondary hover:bg-bg-surface transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-text-muted px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?page=${page + 1}`}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-text-secondary hover:bg-bg-surface transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}