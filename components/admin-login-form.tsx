"use client";

import { useActionState } from "react";

import { loginAdmin, type AdminLoginState } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: AdminLoginState = undefined;

export function AdminLoginForm() {
  const [state, action] = useActionState(loginAdmin, initialState);

  const inputClassName =
    "mt-2 w-full rounded-[1.15rem] border border-[#d8c8b8] bg-[#fff8ef] px-4 py-3 text-sm text-[var(--color-copy)] outline-none transition placeholder:text-[#927d6d] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[#f2dacd]";

  return (
    <form action={action} className="space-y-5">
      <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
        Admin username
        <input
          className={inputClassName}
          name="username"
          type="text"
          autoComplete="username"
          required
        />
      </label>

      <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
        Password
        <input
          className={inputClassName}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state?.error ? (
        <p className="rounded-[1.15rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        idleLabel="Sign In To Dispatch"
        pendingLabel="Checking credentials..."
      />
    </form>
  );
}
