"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "@/app/studio/actions";
import { button, input } from "./ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, { status: "idle" } as FormState);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {state.message && (
        <p role="alert" className="border border-signal/60 px-4 py-3 text-sm">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-mist">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-mist">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      <button type="submit" disabled={pending} className={`${button} w-full`}>
        {pending ? "Signing in…" : "Enter the Studio"}
      </button>
    </form>
  );
}
