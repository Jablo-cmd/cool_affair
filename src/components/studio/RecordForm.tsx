"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/studio/actions";
import type { Field } from "@/lib/studio/resources";
import { FieldInput, type Choice } from "./FieldInput";
import { button, submitWithoutReset } from "./ui";

export function RecordForm({
  fields,
  values,
  choices,
  action,
  submitLabel,
  savedMessage,
  hidden,
  children,
}: {
  fields: Field[];
  values: Record<string, string | string[] | boolean>;
  choices: Record<string, Choice[]>;
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  submitLabel: string;
  savedMessage?: string | null;
  hidden?: Record<string, string>;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as FormState);
  const errors = state.errors ?? {};

  const groups = fields.reduce<{ name: string; fields: Field[] }[]>((acc, field) => {
    const name = field.group ?? "";
    const group = acc.find((g) => g.name === name);
    if (group) group.fields.push(field);
    else acc.push({ name, fields: [field] });
    return acc;
  }, []);

  const message = state.status === "idle" ? savedMessage : state.message;

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="space-y-10" noValidate>
      {message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`border px-4 py-3 text-sm ${state.status === "error" ? "border-signal/60 text-bone" : "border-copper/60 text-bone"}`}
        >
          {message}
        </p>
      )}
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {children}
      {groups.map((group) => (
        <fieldset key={group.name || "main"} className="border-t border-line pt-6">
          {group.name && <legend className="eyebrow mb-6 pr-3 text-bone">{group.name}</legend>}
          <div className="grid gap-6 md:grid-cols-2">
            {group.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={values[field.name] ?? (field.type === "boolean" ? false : "")}
                error={errors[field.name]}
                choices={choices[field.name]}
              />
            ))}
          </div>
        </fieldset>
      ))}
      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-line bg-graphite/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <button type="submit" disabled={pending} className={button}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {state.status === "error" && <span className="text-xs text-signal">Not saved</span>}
      </div>
    </form>
  );
}
