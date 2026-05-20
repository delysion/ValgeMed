import { requireUser, getCurrentUser, getSession } from "./supabase";

// Re-export for backward compatibility
export { requireUser as requireOwnerSession, getCurrentUser, getSession };
