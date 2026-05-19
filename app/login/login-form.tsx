"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";

import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-ice/10 text-ice">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <CardTitle>Tartu Med/Dent OS</CardTitle>
        <CardDescription>Accesso privato single-user. Nessuna registrazione pubblica.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state.error ? (
            <div className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {state.error}
            </div>
          ) : null}
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Verifica..." : "Entra nella console"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
