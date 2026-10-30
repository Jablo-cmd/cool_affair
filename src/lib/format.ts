const dateFormat = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

const shortFormat = new Intl.DateTimeFormat("en-ZA", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

function parse(value: string) {
  // Plain dates (YYYY-MM-DD) are calendar days; anchor them at noon so the
  // Johannesburg time zone never shifts them across midnight.
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = parse(value);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return null;
  const date = parse(value);
  return Number.isNaN(date.getTime()) ? null : shortFormat.format(date);
}

export function yearOf(value: string | null | undefined) {
  return value ? value.slice(0, 4) : null;
}

/** Index numbers in the catalogue style: 01, 02 … */
export function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
