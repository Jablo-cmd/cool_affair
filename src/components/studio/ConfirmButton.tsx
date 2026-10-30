"use client";

import { useFormStatus } from "react-dom";
import { dangerButton } from "./ui";

function Inner({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={dangerButton}>
      {pending ? "Working…" : label}
    </button>
  );
}

/** A form that asks for confirmation before running a destructive action. */
export function ConfirmForm({
  action,
  label,
  question,
}: {
  action: () => Promise<void>;
  label: string;
  question: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    >
      <Inner label={label} />
    </form>
  );
}
