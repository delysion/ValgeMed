import "server-only";

import { neon } from "@neondatabase/serverless";
import type { User } from "@supabase/supabase-js";
import { isOwnerUser } from "@/lib/auth/owner";

export async function getOrCreateProfile(user: User) {
  const sql = neon(process.env.DATABASE_URL!);
  const [profile] = await sql`SELECT approved, is_admin, notified_at FROM profiles WHERE id = ${user.id}`;
  if (profile) return profile;

  const email = user.email ?? "";
  const displayName = typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name
    : email;
  await sql`
    INSERT INTO profiles (id, email, display_name, approved)
    VALUES (${user.id}, ${email}, ${displayName}, false)
    ON CONFLICT (id) DO NOTHING
  `;

  const [created] = await sql`SELECT approved, is_admin, notified_at FROM profiles WHERE id = ${user.id}`;
  return created;
}

export async function getProfileStatus(user: User) {
  const profile = await getOrCreateProfile(user);
  const owner = isOwnerUser(user.id);
  return {
    hasProfile: !!profile,
    approved: owner || !!profile?.approved || !!profile?.is_admin,
    isAdmin: owner || !!profile?.is_admin,
    notified: !!profile?.notified_at,
  };
}
