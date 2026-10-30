import { slugify } from "@/lib/format";
import type { Field } from "./resources";

export type FieldErrors = Record<string, string>;

const URL_RE = /^https?:\/\/[^\s]+$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(form: FormData, name: string) {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Turns submitted form data into a typed row, validating every field on the
 * server. Unknown form keys are ignored, so a client cannot write columns that
 * are not declared in the resource config.
 */
export function parseFields(fields: Field[], form: FormData) {
  const values: Record<string, unknown> = {};
  const errors: FieldErrors = {};

  for (const field of fields) {
    const raw = str(form, field.name);
    const fail = (message: string) => {
      errors[field.name] = message;
    };

    if (field.maxLength && raw.length > field.maxLength) {
      fail(`Keep this under ${field.maxLength} characters.`);
      continue;
    }

    switch (field.type) {
      case "boolean":
        values[field.name] = form.get(field.name) === "on";
        continue;
      case "tags":
        values[field.name] = raw
          ? [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))]
          : [];
        continue;
      case "relations":
        values[field.name] = form
          .getAll(field.name)
          .filter((v): v is string => typeof v === "string" && UUID_RE.test(v));
        continue;
    }

    if (!raw) {
      if (field.required && field.type !== "slug") fail("Required.");
      values[field.name] = null;
      continue;
    }

    switch (field.type) {
      case "url":
        if (!URL_RE.test(raw)) fail("Use a full link starting with https://");
        else values[field.name] = raw;
        break;
      case "email":
        if (!EMAIL_RE.test(raw)) fail("That email address doesn't look right.");
        else values[field.name] = raw.toLowerCase();
        break;
      case "date":
        if (!DATE_RE.test(raw) || Number.isNaN(Date.parse(raw))) fail("Use a valid date.");
        else values[field.name] = raw;
        break;
      case "datetime":
        // Johannesburg has no daylight saving: SAST is always UTC+02:00.
        if (!DATETIME_RE.test(raw)) fail("Use a valid date and time.");
        else values[field.name] = new Date(`${raw}:00+02:00`).toISOString();
        break;
      case "number": {
        const n = Number(raw);
        if (!Number.isInteger(n) || Math.abs(n) > 1_000_000) fail("Use a whole number.");
        else values[field.name] = n;
        break;
      }
      case "select":
        if (field.options && !field.options.some((o) => o.value === raw)) fail("Choose one of the options.");
        else values[field.name] = raw;
        break;
      case "media":
      case "relation":
        if (!UUID_RE.test(raw)) fail("Choose an item from the list.");
        else values[field.name] = raw;
        break;
      case "slug": {
        const slug = slugify(raw);
        if (!slug) fail("Use letters and numbers.");
        else values[field.name] = slug;
        break;
      }
      default:
        values[field.name] = raw;
    }
  }

  // Slugs left blank are derived from their source field.
  for (const field of fields) {
    if (field.type === "slug" && !values[field.name] && !errors[field.name]) {
      const source = field.from ? values[field.from] : null;
      const slug = typeof source === "string" ? slugify(source) : "";
      if (slug) values[field.name] = slug;
      else errors[field.name] = "Required.";
    }
  }

  return { values, errors };
}

/** Value as shown in an <input> for an existing row. */
export function toInputValue(field: Field, value: unknown): string | string[] | boolean {
  if (value === null || value === undefined) return field.type === "boolean" ? false : field.type === "relations" ? [] : "";
  switch (field.type) {
    case "boolean":
      return Boolean(value);
    case "tags":
      return Array.isArray(value) ? value.join(", ") : String(value);
    case "relations":
      return Array.isArray(value) ? value.map(String) : [];
    case "datetime": {
      // Show the stored UTC timestamp in Johannesburg time (UTC+2).
      const d = new Date(String(value));
      if (Number.isNaN(d.getTime())) return "";
      return new Date(d.getTime() + 2 * 3600_000).toISOString().slice(0, 16);
    }
    default:
      return String(value);
  }
}
