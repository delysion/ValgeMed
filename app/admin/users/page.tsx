import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db/admin";
import { profiles } from "@/lib/db/schema";
import { UserRow } from "./user-row";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminUsersPage(props: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { t } = getI18n();
  const searchParams = await props.searchParams;
  const admin = await requireAdmin();
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [paged, [{ count }]] = await Promise.all([
    db.query.profiles.findMany({
      orderBy: (profiles, { asc }) => [asc(profiles.createdAt)],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    db.select({ count: sql<number>`count(*)::int` }).from(profiles),
  ]);

  const total = Number(count);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-1">{t("admin.title")}</h1>
      <p className="text-sm text-text-secondary mb-6">
        {t("admin.description", { email: admin.email })}
      </p>

      <div className="space-y-3 mb-6">
        {total === 0 && (
          <p className="text-sm text-text-muted">{t("admin.noUsers")}</p>
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
              {t("admin.previous")}
            </Link>
          )}
          <span className="text-text-muted px-2">
            {t("admin.pageInfo", { page, totalPages })}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?page=${page + 1}`}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-text-secondary hover:bg-bg-surface transition-colors"
            >
              {t("admin.next")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}