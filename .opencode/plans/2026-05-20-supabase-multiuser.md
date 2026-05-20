# Supabase Auth + RLS Multi-User Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ValgeMed from single-owner to multi-user system with Google OAuth login and Postgres RLS data isolation.

**Architecture:** Replace custom JWT auth with Supabase Auth (@supabase/ssr). Add `user_id` foreign key to all 27 tables. Enable RLS policies so users only see their own data. Update all queries and server actions to filter by `auth.uid()`.

**Tech Stack:** @supabase/ssr, @supabase/supabase-js, Drizzle ORM (existing), Neon Postgres (existing), Next.js 16

---

## PHASE 1: Setup Supabase Client + Middleware

### Task 1: Install Supabase packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install @supabase/ssr and @supabase/supabase-js**

Run: `npm install @supabase/ssr @supabase/supabase-js`

Expected: Packages installed without errors

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json && git commit -m "feat: add supabase packages"
```

---

### Task 2: Create Supabase client utilities

**Files:**
- Create: `lib/supabase/server.ts` - Server-side client with cookie-based session
- Create: `lib/supabase/client.ts` - Client-side singleton
- Create: `lib/supabase/middleware.ts` - Edge middleware for auth
- Create: `lib/supabase/types.ts` - Auth callback types

- [ ] **Step 1: Create lib/supabase/server.ts**

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server component - ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name, options);
          } catch {
            // Server component - ignore
          }
        },
      },
    },
  );
}
```

Note: This uses async cookies from Next.js 16.

- [ ] **Step 2: Create lib/supabase/client.ts**

```typescript
import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function getClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return client;
}
```

- [ ] **Step 3: Create lib/supabase/middleware.ts**

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}
```

- [ ] **Step 4: Create lib/supabase/types.ts**

```typescript
export type AuthCallbackSearchParams = {
  code: string;
  next?: string;
};
```

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/ && git commit -m "feat: add supabase client utilities"
```

---

### Task 3: Replace proxy.ts with Next.js middleware using Supabase

**Files:**
- Create: `middleware.ts` at project root (replaces proxy.ts)
- Delete: `proxy.ts` after testing

- [ ] **Step 1: Create middleware.ts at project root**

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const privatePrefixes = [
  "/command",
  "/dashboard",
  "/elite-index",
  "/subjects",
  "/exams",
  "/topics",
  "/study",
  "/study-sessions",
  "/reviews",
  "/errors",
  "/daily-log",
  "/goals",
  "/identity",
  "/tartu",
  "/time",
  "/health",
  "/language",
  "/reputation",
  "/opportunities",
  "/network",
  "/life-admin",
  "/portfolio",
  "/strategic-review",
  "/ai",
  "/settings",
  "/api/export",
];

const publicPaths = ["/login", "/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if path requires auth
  const isPrivate = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isPrivate) {
    return NextResponse.next();
  }

  // Update session with Supabase
  const response = await updateSession(request);

  // Check if authenticated via Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Create a minimal client to check auth
  const url = new URL("/auth/user", supabaseUrl);
  const responseHeaders = new Headers();
  response.cookies.getAll().forEach((cookie) => {
    responseHeaders.append("cookie", `${cookie.name}=${cookie.value}`);
  });

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: responseHeaders,
    });

    if (res.ok) {
      return response;
    }
  } catch {
    // Fall through to redirect
  }

  // Redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Test middleware locally**

Run: `npm run dev` and check if protected routes redirect to login when not authenticated.

Expected: Protected routes redirect properly

- [ ] **Step 3: Delete proxy.ts after confirming middleware works**

```bash
rm proxy.ts && git add -A && git commit -m "feat: replace proxy.ts with supabase middleware"
```

---

## PHASE 2: Database Schema Changes

### Task 4: Create profiles table and add user_id to all tables

**Files:**
- Create: `supabase_migration.sql` at project root

- [ ] **Step 1: Create migration file at project root: `supabase_migration.sql`**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS to profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add user_id to all tables (27 tables)
-- Subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

-- Exams
ALTER TABLE exams ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own exams" ON exams
  FOR ALL USING (auth.uid() = user_id);

-- Topics
ALTER TABLE topics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own topics" ON topics
  FOR ALL USING (auth.uid() = user_id);

-- Study Sessions
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own study sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Review Items
ALTER TABLE review_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE review_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own review items" ON review_items
  FOR ALL USING (auth.uid() = user_id);

-- Error Logs
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own error logs" ON error_logs
  FOR ALL USING (auth.uid() = user_id);

-- Quiz Attempts
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own quiz attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Daily Logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own daily logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- Goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

-- Tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Identity Notes
ALTER TABLE identity_notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE identity_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own identity notes" ON identity_notes
  FOR ALL USING (auth.uid() = user_id);

-- Tartu Notes
ALTER TABLE tartu_notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tartu_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own tartu notes" ON tartu_notes
  FOR ALL USING (auth.uid() = user_id);

-- Time Blocks
ALTER TABLE time_blocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own time blocks" ON time_blocks
  FOR ALL USING (auth.uid() = user_id);

-- Health Logs
ALTER TABLE health_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own health logs" ON health_logs
  FOR ALL USING (auth.uid() = user_id);

-- Language Progress
ALTER TABLE language_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE language_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own language progress" ON language_progress
  FOR ALL USING (auth.uid() = user_id);

-- Reputation Events
ALTER TABLE reputation_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own reputation events" ON reputation_events
  FOR ALL USING (auth.uid() = user_id);

-- Opportunities
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own opportunities" ON opportunities
  FOR ALL USING (auth.uid() = user_id);

-- Professional Contacts
ALTER TABLE professional_contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE professional_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own professional contacts" ON professional_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Life Admin Items
ALTER TABLE life_admin_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE life_admin_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own life admin items" ON life_admin_items
  FOR ALL USING (auth.uid() = user_id);

-- Portfolio Items
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own portfolio items" ON portfolio_items
  FOR ALL USING (auth.uid() = user_id);

-- Strategic Reviews
ALTER TABLE strategic_reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE strategic_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own strategic reviews" ON strategic_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Research Areas
ALTER TABLE research_areas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own research areas" ON research_areas
  FOR ALL USING (auth.uid() = user_id);

-- Literature Gaps
ALTER TABLE literature_gaps ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE literature_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own literature gaps" ON literature_gaps
  FOR ALL USING (auth.uid() = user_id);

-- Hypotheses
ALTER TABLE hypotheses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own hypotheses" ON hypotheses
  FOR ALL USING (auth.uid() = user_id);

-- Manuscripts
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own manuscripts" ON manuscripts
  FOR ALL USING (auth.uid() = user_id);

-- Methodology Risks
ALTER TABLE methodology_risks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE methodology_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own methodology risks" ON methodology_risks
  FOR ALL USING (auth.uid() = user_id);

-- Uploads
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own uploads" ON uploads
  FOR ALL USING (auth.uid() = user_id);
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy-paste the entire SQL from above
3. Click **Run**

Expected: All tables modified with user_id column + RLS enabled + policies created

- [ ] **Step 3: Verify migration**

In Supabase → **Table Editor** → check that each table has a `user_id` column.

Expected: All 27 tables have user_id column

- [ ] **Step 4: Commit migration file**

```bash
git add supabase_migration.sql && git commit -m "feat: add user_id to all tables and enable RLS"
```

---

## PHASE 3: Update Auth Layer

### Task 5: Create new auth utility using Supabase

**Files:**
- Create: `lib/auth/supabase.ts` - Supabase auth helpers
- Modify: `lib/auth/session.ts` - Add supabase client helper

- [ ] **Step 1: Create lib/auth/supabase.ts**

```typescript
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
```

- [ ] **Step 2: Update lib/auth/session.ts to re-export from supabase.ts**

```typescript
import { requireUser, getCurrentUser, getSession } from "./supabase";

// Re-export for backward compatibility
export { requireUser as requireOwnerSession, getCurrentUser, getSession };
```

Note: This keeps existing code working while transitioning.

- [ ] **Step 3: Commit**

```bash
git add lib/auth/supabase.ts lib/auth/session.ts && git commit -m "feat: add supabase auth utilities"
```

---

### Task 6: Create login page with Google OAuth + OAuth callback handler

**Files:**
- Modify: `app/login/page.tsx` (replace existing)
- Create: `app/auth/callback/route.ts` - Handles OAuth callback

- [ ] **Step 1: Create app/auth/callback/route.ts**

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/command";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalHost = process.env.NODE_ENV === "development";

      if (isLocalHost) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Auth failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

- [ ] **Step 2: Update app/login/page.tsx with Google OAuth button**

```tsx
import { redirect } from "next/navigation";
import { Command } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/command");
  }

  async function loginWithGoogle() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-page p-4 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/20 via-bg-page to-cyan-bg/10" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/6 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-cyan/5 blur-[80px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center motion-premium">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-[0_8px_32px_rgba(80,64,208,0.25)]">
            <Command className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">ValgeMed</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            A quiet command system for serious medical students.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-bg-surface/90 p-6 shadow-[var(--shadow-premium)] backdrop-blur-sm motion-stagger-1">
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          Multi-user system. Sign in with your Google account.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add NEXT_PUBLIC_APP_URL to environment variables**

Update `.env.local`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Update Vercel environment variables when deploying.

- [ ] **Step 4: Commit**

```bash
git add app/auth/callback/route.ts app/login/page.tsx .env.local && git commit -m "feat: add Google OAuth login flow"
```

---

### Task 7: Add logout action

**Files:**
- Modify: `lib/auth/actions.ts` (update logoutAction)

- [ ] **Step 1: Update lib/auth/actions.ts**

```typescript
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth/actions.ts && git commit -m "feat: update logout to use Supabase"
```

---

## PHASE 4: Update All Queries and Server Actions

### Task 8: Create authenticated DB helper that injects user_id

**Files:**
- Create: `lib/db/auth.ts` - Authenticated query helpers

- [ ] **Step 1: Create lib/db/auth.ts**

```typescript
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";

export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/auth.ts && git commit -m "feat: add auth db helpers"
```

---

### Task 9: Update lib/actions/resources.ts to use user_id

**Files:**
- Modify: `lib/actions/resources.ts` (all 40+ actions)

- [ ] **Step 1: Rewrite authorizedDb function**

Replace:
```typescript
async function authorizedDb() {
  await requireOwnerSession();
  return getDb();
}
```

With:
```typescript
async function authorizedDb() {
  const userId = await requireAuthUserId(); // from lib/db/auth.ts
  const db = getDb();
  return { db, userId };
}
```

- [ ] **Step 2: Update all action functions to inject user_id**

Every create/update/delete operation needs `userId` in the values:

For example, `createSubjectAction` becomes:
```typescript
export async function createSubjectAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const data = parseForm(subjectSchema, formData);
  await db.insert(subjects).values({ ...data, userId });
  refresh(["/subjects", "/dashboard"]);
}
```

Every mutation (create/update/delete) needs `userId` in `.values()` or `.where()`.

- [ ] **Step 3: For delete operations, ensure user owns the record**

Update delete pattern to:
```typescript
export async function deleteSubjectAction(formData: FormData) {
  const { db, userId } = await authorizedDb();
  const recordId = parseId(formData);
  await db.delete(subjects).where(
    and(eq(subjects.id, recordId), eq(subjects.userId, userId))
  );
  refresh(["/subjects", "/dashboard"]);
  redirect("/subjects");
}
```

Note: RLS also enforces this at DB level, so it's double protection.

- [ ] **Step 4: Commit**

```bash
git add lib/actions/resources.ts && git commit -m "feat: update all server actions with user_id"
```

---

### Task 10: Update lib/data/queries.ts to filter by user_id

**Files:**
- Modify: `lib/data/queries.ts` - All read queries

- [ ] **Step 1: Add user_id to all query functions**

`getCoreData()` needs to:
1. Get userId first
2. Add `eq(table.userId, userId)` to every query

Example transformation:
```typescript
// Before
export async function getCoreData() {
  const [subjectsData] = await Promise.all([
    db.select().from(subjects).orderBy(desc(subjects.createdAt)),
  ]);
  // ...
}

// After
export async function getCoreData() {
  const userId = await getUserId();
  const [subjectsData] = await Promise.all([
    db.select().from(subjects)
      .where(eq(subjects.userId, userId))
      .orderBy(desc(subjects.createdAt)),
  ]);
  // ...
}
```

- [ ] **Step 2: Apply to all queries in getCoreData and getDashboardData**

All 22 entity queries need the userId filter.

- [ ] **Step 3: Commit**

```bash
git add lib/data/queries.ts && git commit -m "feat: update queries to filter by user_id"
```

---

## PHASE 5: Update Pages to Use New Auth

### Task 11: Update all protected pages to use requireUser instead of requireOwnerSession

**Files:**
- Modify: All 30+ pages in `app/*/page.tsx`

This is a bulk find-replace operation:
- Find: `requireOwnerSession` (import from lib/auth/session)
- Replace: `requireUser` (import from lib/auth/supabase)

The function signatures are the same, so pages don't need logic changes - just the import and function call.

- [ ] **Step 1: Bulk update imports and function calls**

In each protected page, change:
```typescript
import { requireOwnerSession } from "@/lib/auth/session";
// becomes
import { requireUser } from "@/lib/auth/supabase";
```

And:
```typescript
const session = await requireOwnerSession();
// becomes
const user = await requireUser();
```

Note: The `session` variable may have been used for `session.email` display. Update to use user.email from Supabase user object.

- [ ] **Step 2: Update AppShell component props**

AppShell currently expects `session: OwnerSession`. Update to expect `user: User` from Supabase.

In `components/app-shell.tsx`:
```typescript
// Before
type AppShellProps = {
  session: OwnerSession;
};

// After
type AppShellProps = {
  user: User; // from @supabase/supabase-js
};
```

- [ ] **Step 3: Commit**

```bash
git add app/*/page.tsx components/app-shell.tsx && git commit -m "feat: update pages to use supabase auth"
```

---

## PHASE 6: Cleanup and Verification

### Task 12: Remove old auth files (after verifying everything works)

**Files to delete:**
- `lib/auth/constants.ts` (replaced by Supabase)
- `lib/auth/session.ts` (replaced by lib/auth/supabase.ts)
- `lib/auth/actions.ts` (replaced by Supabase client + new actions)
- `proxy.ts` (replaced by middleware.ts)

- [ ] **Step 1: Verify all functionality works**

Test:
1. Login with Google
2. Create a subject
3. Logout
4. Login as different user
5. Verify cannot see other user's subjects

- [ ] **Step 2: Delete old files**

Only after full verification:
```bash
rm lib/auth/constants.ts lib/auth/session.ts lib/auth/actions.ts proxy.ts
```

- [ ] **Step 3: Commit cleanup**

```bash
git add -A && git commit -m "chore: remove legacy auth files"
```

---

## Verification Checklist

After implementation, verify:

- [ ] Google OAuth login works end-to-end
- [ ] Logout clears session
- [ ] Protected routes redirect to login when not authenticated
- [ ] Creating data associates it with the current user (user_id)
- [ ] Querying data only returns current user's data
- [ ] RLS prevents cross-user data access at DB level
- [ ] Different users see only their own data
- [ ] App Shell displays correct user email
- [ ] No console errors in dev mode
- [ ] Production deploy works on Vercel

---

## Execution Options

**Plan complete and saved to `.opencode/plans/2026-05-20-supabase-multiuser.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**