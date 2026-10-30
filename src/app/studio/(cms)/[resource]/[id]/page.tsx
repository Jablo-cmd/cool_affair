import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRecord, saveRecord } from "../../../actions";
import { ConfirmForm } from "@/components/studio/ConfirmButton";
import { StatusPill, StudioHeader } from "@/components/studio/PageHeader";
import { RecordForm } from "@/components/studio/RecordForm";
import { ghostButton } from "@/components/studio/ui";
import { publicStorageUrl } from "@/lib/env";
import { requireStaff } from "@/lib/studio/auth";
import { loadChoices } from "@/lib/studio/choices";
import { toInputValue } from "@/lib/studio/parse";
import { getResource, resources } from "@/lib/studio/resources";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditRecord({ params, searchParams }: PageProps<"/studio/[resource]/[id]">) {
  const [{ resource: key, id }, query] = await Promise.all([params, searchParams]);
  const resource = getResource(key);
  if (!resource || !UUID.test(id)) notFound();
  const { db } = await requireStaff();

  const [{ data }, choices] = await Promise.all([
    db.from(resource.table).select("*").eq("id", id).maybeSingle(),
    loadChoices(db, resource.fields),
  ]);
  if (!data) notFound();
  const row = data as Record<string, unknown>;

  const values = Object.fromEntries(resource.fields.map((f) => [f.name, toInputValue(f, row[f.name])]));
  const title = String(row[resource.titleColumn] ?? resource.singular);
  const isPublic =
    resource.key === "media" ? row.status === "approved" : row.status === "published" && (resource.key !== "collaborators" || row.verified);
  const publicHref = resource.publicPath && isPublic
    ? resource.publicPath.replace(/\{(\w+)\}/g, (_, k: string) => encodeURIComponent(String(row[k] ?? "")))
    : null;

  let backHref = `/studio/${resource.key}`;
  let backLabel = resource.label;
  if (resource.parent && row[resource.parent.column]) {
    backHref = `/studio/${resource.key}?${resource.parent.param}=${row[resource.parent.column]}`;
    backLabel = resources[resource.parent.resource].label;
  }

  let children: { count: number; href: string; label: string } | null = null;
  if (resource.child) {
    const child = resources[resource.child.resource];
    const { count } = await db.from(child.table).select("id", { count: "exact", head: true }).eq(child.parent!.column, id);
    children = { count: count ?? 0, href: `/studio/${child.key}?${resource.child.param}=${id}`, label: resource.child.label };
  }

  const mediaUrl = resource.key === "media" ? (row.storage_path ? publicStorageUrl(String(row.storage_path)) : (row.external_url as string | null)) : null;

  return (
    <>
      <StudioHeader
        title={title}
        crumbs={[{ href: backHref, label: backLabel }]}
        actions={
          <>
            {"status" in row && <StatusPill status={String(row.status)} />}
            {publicHref && (
              <Link href={publicHref} target="_blank" className={ghostButton}>
                View live ↗
              </Link>
            )}
            {children && (
              <Link href={children.href} className={ghostButton}>
                {children.label} ({children.count})
              </Link>
            )}
          </>
        }
      />

      {resource.key === "media" && mediaUrl && (
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start">
          {row.kind === "image" ? (
            <div className="relative h-56 w-full max-w-sm overflow-hidden bg-ink">
              <Image src={mediaUrl} alt={String(row.alt_text ?? "")} fill sizes="384px" className="object-contain" unoptimized />
            </div>
          ) : row.kind === "audio" ? (
            <audio controls src={mediaUrl} className="w-full max-w-md" />
          ) : (
            <video controls src={mediaUrl} className="max-h-64 w-full max-w-md bg-ink" />
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-mist">
            <dt>Kind</dt><dd className="text-silver">{String(row.kind)}</dd>
            {row.width ? (<><dt>Size</dt><dd className="text-silver">{String(row.width)} × {String(row.height)}</dd></>) : null}
            <dt>File</dt><dd className="break-all text-silver">{String(row.storage_path ?? row.external_url)}</dd>
          </dl>
        </div>
      )}

      <RecordForm
        fields={resource.fields}
        values={values}
        choices={choices}
        action={saveRecord.bind(null, resource.key, id)}
        submitLabel="Save changes"
        savedMessage={query.saved ? "Saved. Published changes are live on the site." : null}
      />

      <section className="mt-16 border-t border-line pt-6">
        <h2 className="eyebrow mb-3 text-bone">Delete</h2>
        <p className="mb-4 max-w-xl text-sm text-mist">
          {resource.key === "media"
            ? "Deletes the record and its stored file. Anything using it will stop showing it."
            : resource.child
              ? "Deletes this record and its track listing. This cannot be undone. To hide it instead, set it to Draft."
              : "This cannot be undone. To hide it instead, set it to Draft."}
        </p>
        <ConfirmForm
          action={deleteRecord.bind(null, resource.key, id)}
          label={`Delete ${resource.singular}`}
          question={`Delete “${title}” permanently?`}
        />
      </section>
    </>
  );
}
