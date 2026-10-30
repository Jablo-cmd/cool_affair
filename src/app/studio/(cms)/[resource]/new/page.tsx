import { notFound, redirect } from "next/navigation";
import { saveRecord } from "../../../actions";
import { StudioHeader } from "@/components/studio/PageHeader";
import { RecordForm } from "@/components/studio/RecordForm";
import { requireStaff } from "@/lib/studio/auth";
import { loadChoices } from "@/lib/studio/choices";
import { getResource, resources } from "@/lib/studio/resources";

// Sensible defaults so a new record starts hidden and honest.
const DEFAULTS: Record<string, Record<string, string | boolean>> = {
  releases: { status: "draft", kind: "project", stage: "concept", sort_order: "100" },
  events: { status: "draft", format: "dj_set" },
  archive: { status: "draft", category: "project", sort_order: "0" },
  alchemy: { status: "draft", kind: "experiment" },
  journal: { status: "draft", category: "reflection" },
  collaborators: { status: "draft", sort_order: "0" },
  tracks: { position: "1" },
};

export default async function NewRecord({ params, searchParams }: PageProps<"/studio/[resource]/new">) {
  const [{ resource: key }, query] = await Promise.all([params, searchParams]);
  if (key === "media") redirect("/studio/media/new");
  const resource = getResource(key);
  if (!resource) notFound();
  const { db } = await requireStaff();
  const choices = await loadChoices(db, resource.fields);

  const values: Record<string, string | boolean> = { ...(DEFAULTS[key] ?? {}) };
  let returnTo: string | undefined;
  if (resource.parent) {
    const parentId = query[resource.parent.param];
    if (typeof parentId === "string") {
      values[resource.parent.column] = parentId;
      returnTo = `/studio/${resource.key}?${resource.parent.param}=${parentId}`;
      if (key === "tracks") {
        const { count } = await db.from("ca_tracks").select("id", { count: "exact", head: true }).eq("release_id", parentId);
        values.position = String((count ?? 0) + 1);
      }
    }
  }

  return (
    <>
      <StudioHeader
        title={`New ${resource.singular}`}
        description={resource.description}
        crumbs={[{ href: returnTo ?? `/studio/${resource.key}`, label: resource.parent && returnTo ? resources[resource.parent.resource].label : resource.label }]}
      />
      <RecordForm
        fields={resource.fields}
        values={values}
        choices={choices}
        action={saveRecord.bind(null, resource.key, null)}
        submitLabel={`Create ${resource.singular}`}
        hidden={returnTo ? { return_to: returnTo } : undefined}
      />
    </>
  );
}
