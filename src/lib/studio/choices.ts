import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mediaStatusLabels } from "@/lib/data/labels";
import type { MediaStatus } from "@/lib/data/types";
import type { Field } from "./resources";

/** Loads the options for media and relation pickers used by a set of fields. */
export async function loadChoices(db: SupabaseClient, fields: Field[]) {
  const choices: Record<string, { value: string; label: string }[]> = {};
  const needsMedia = fields.some((f) => f.type === "media");
  const media = needsMedia
    ? ((await db.from("ca_media_assets").select("id, title, kind, status").order("created_at", { ascending: false })).data ?? [])
    : [];

  for (const field of fields) {
    if (field.type === "media") {
      choices[field.name] = media
        .filter((m) => !field.mediaKind || m.kind === field.mediaKind)
        .map((m) => ({
          value: m.id as string,
          label: `${m.title} · ${m.kind}${m.status === "approved" ? "" : ` (${mediaStatusLabels[m.status as MediaStatus].toLowerCase()}, hidden)`}`,
        }));
    }
    if ((field.type === "relation" || field.type === "relations") && field.table && field.labelColumn) {
      const { data } = await db.from(field.table).select(`id, ${field.labelColumn}`).order(field.labelColumn);
      choices[field.name] = ((data ?? []) as unknown as Record<string, string>[]).map((row) => ({
        value: row.id,
        label: row[field.labelColumn!] ?? row.id,
      }));
    }
  }
  return choices;
}
