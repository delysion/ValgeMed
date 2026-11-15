import "server-only";

import { neon } from "@neondatabase/serverless";
import { isOwnerUser } from "@/lib/auth/owner";

export async function setUserApproval(actorId: string, profileId: string, approved: boolean) {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    WITH changed AS (
      UPDATE profiles
      SET approved = ${approved}, notified_at = NULL, notification_claimed_until = NULL,
          rejected_at = CASE WHEN ${approved}::boolean THEN NULL ELSE now() END
      WHERE id = ${profileId}
        AND (${isOwnerUser(actorId)} OR EXISTS (
          SELECT 1 FROM profiles WHERE id = ${actorId} AND is_admin = true
        ))
        AND (approved IS DISTINCT FROM ${approved}
          OR (rejected_at IS NULL) IS DISTINCT FROM ${approved})
      RETURNING id, approved
    )
    INSERT INTO approval_audit (actor_id, profile_id, approved)
    SELECT ${actorId}, id, approved FROM changed
  `;
}
