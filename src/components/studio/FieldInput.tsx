"use client";

import type { Field } from "@/lib/studio/resources";
import { input } from "./ui";

export type Choice = { value: string; label: string };

export function FieldInput({
  field,
  value,
  error,
  choices,
}: {
  field: Field;
  value: string | string[] | boolean;
  error?: string;
  choices?: Choice[];
}) {
  const id = `f-${field.name}`;
  const describedBy = [error ? `${id}-error` : null, field.help ? `${id}-help` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: field.name,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
  };

  let control: React.ReactNode;
  switch (field.type) {
    case "boolean":
      control = (
        <label className="flex items-center gap-3 text-sm text-silver">
          <input type="checkbox" {...common} defaultChecked={Boolean(value)} className="h-4 w-4 accent-[var(--color-copper)]" />
          {field.label}
        </label>
      );
      break;
    case "textarea":
    case "markdown":
      control = (
        <textarea
          {...common}
          defaultValue={String(value)}
          maxLength={field.maxLength}
          rows={field.type === "markdown" ? 12 : 4}
          className={`${input} resize-y ${field.type === "markdown" ? "font-mono text-[0.8125rem] leading-relaxed" : ""}`}
        />
      );
      break;
    case "select":
      control = (
        <select {...common} defaultValue={String(value)} className={input}>
          {!field.required && <option value="">—</option>}
          {field.required && !value && (
            <option value="" disabled>
              Choose…
            </option>
          )}
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "media":
    case "relation":
      control = (
        <select {...common} defaultValue={String(value)} className={input}>
          <option value="">{field.required ? "Choose…" : "None"}</option>
          {choices?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "relations": {
      const selected = new Set(Array.isArray(value) ? value : []);
      control = (
        <fieldset aria-describedby={describedBy} className="max-h-56 space-y-1 overflow-y-auto border border-line p-3">
          <legend className="sr-only">{field.label}</legend>
          {choices?.length ? (
            choices.map((o) => (
              <label key={o.value} className="flex items-center gap-3 text-sm text-silver">
                <input type="checkbox" name={field.name} value={o.value} defaultChecked={selected.has(o.value)} className="h-4 w-4 accent-[var(--color-copper)]" />
                {o.label}
              </label>
            ))
          ) : (
            <p className="text-sm text-mist">Nothing to choose from yet.</p>
          )}
        </fieldset>
      );
      break;
    }
    default: {
      const type =
        field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : field.type === "number" ? "number" : "text";
      control = (
        <input
          {...common}
          type={type}
          defaultValue={String(value)}
          maxLength={field.maxLength}
          step={field.type === "number" ? 1 : undefined}
          placeholder={field.type === "url" ? "https://" : undefined}
          className={`${input} [color-scheme:dark]`}
        />
      );
    }
  }

  return (
    <div className={field.wide ? "md:col-span-2" : undefined}>
      {field.type !== "boolean" && (
        <label htmlFor={field.type === "relations" ? undefined : id} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-mist">
          {field.label}
          {field.required && <span className="text-copper"> *</span>}
          {field.type === "markdown" && <span className="ml-2 normal-case tracking-normal text-mist">Markdown: ## heading, **bold**, *italic*, [link](https://…), - list, &gt; quote</span>}
        </label>
      )}
      {control}
      {field.help && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-mist">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-signal">
          {error}
        </p>
      )}
    </div>
  );
}
