"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function SubmitButton({
  idleLabel,
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-13 w-full items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-5 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_16px_32px_rgba(126,47,24,0.28)] transition hover:scale-[1.01] hover:shadow-[0_20px_38px_rgba(126,47,24,0.34)] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
