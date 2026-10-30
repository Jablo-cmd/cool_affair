"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/studio/actions";
import { enquiryStatusLabels, options } from "@/lib/data/labels";
import { button, input, submitWithoutReset } from "./ui";

export function EnquiryUpdate({
  status,
  action,
}: {
  status: string;
  action: (prev: FormState, form: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as FormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "saved") {
      const note = formRef.current?.elements.namedItem("note");
      if (note instanceof HTMLTextAreaElement) note.value = "";
    }
  }, [state]);

  return (
    <form ref={formRef} onSubmit={submitWithoutReset(formAction)} className="space-y-4">
      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"} className={`border px-3 py-2 text-sm ${state.status === "error" ? "border-signal/60" : "border-copper/60"}`}>
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor="status" className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-mist">Status</label>
        <select id="status" name="status" defaultValue={status} className={input}>
          {options(enquiryStatusLabels).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="note" className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-mist">Internal note</label>
        <textarea id="note" name="note" rows={4} maxLength={4000} className={`${input} resize-y`} placeholder="Only visible in the Studio" />
      </div>
      <button type="submit" disabled={pending} className={button}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
