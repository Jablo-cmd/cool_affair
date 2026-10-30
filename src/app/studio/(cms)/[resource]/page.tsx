import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill, StudioHeader } from "@/components/studio/PageHeader";
import { button } from "@/components/studio/ui";
import { publicStorageUrl } from "@/lib/env";
import { formatShortDate } from "@/lib/format";
import { requireStaff } from "@/lib/studio/auth";
import { getResource, resources, type ListColumn } from "@/lib/studio/resources";

function Cell({ column, value }: { column: ListColumn; value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-smoke">—</span>;
  switch (column.format) {
    case "date":
    case "datetime":
      return <>{formatShortDate(String(value))}</>;
    case "boolean":
      return value ? <span className="text-copper">Yes</span> : <span className="text-mist">No</span>;
    case "status":
      return <StatusPill status={String(value)} />;
    case "label":
      return <>{column.labels?.[String(value)] ?? String(value)}</>;
    default:
      return <>{String(value)}</>;
  }
}

export default async function ResourceList({ params, searchParams }: PageProps<"/studio/[resource]">) {
  const [{ resource: key }, query] = await Promise.all([params, searchParams]);
  const resource = getResource(key);
  if (!resource) notFound();
  const { db } = await requireStaff();

  const parentId = resource.parent && typeof query[resource.parent.param] === "string" ? String(query[resource.parent.param]) : null;
  const q = typeof query.q === "string" ? query.q.trim() : "";

  const columns = ["id", ...new Set([...resource.list.map((c) => c.name), resource.titleColumn, ...(resource.key === "media" ? ["storage_path", "external_url", "kind"] : [])])];
  let request = db.from(resource.table).select(columns.join(", "));
  if (parentId && resource.parent) request = request.eq(resource.parent.column, parentId);
  if (q) request = request.ilike(resource.titleColumn, `%${q.replace(/[%_]/g, "")}%`);
  for (const order of resource.orderBy) request = request.order(order.column, { ascending: order.ascending, nullsFirst: false });
  const { data, error } = await request.limit(500);
  const rows = (data ?? []) as unknown as Record<string, unknown>[];

  let parentTitle: string | null = null;
  if (parentId && resource.parent) {
    const parent = resources[resource.parent.resource];
    const { data: p } = await db.from(parent.table).select(parent.titleColumn).eq("id", parentId).maybeSingle();
    parentTitle = p ? String((p as unknown as Record<string, unknown>)[parent.titleColumn]) : null;
  }

  const newHref = resource.key === "media" ? "/studio/media/new" : `/studio/${resource.key}/new${parentId ? `?${resource.parent!.param}=${parentId}` : ""}`;

  return (
    <>
      <StudioHeader
        title={parentTitle ? `${resource.label}: ${parentTitle}` : resource.label}
        description={resource.description}
        crumbs={parentId && resource.parent ? [{ href: `/studio/${resource.parent.resource}/${parentId}`, label: parentTitle ?? "Back" }] : undefined}
        actions={
          <Link href={newHref} className={button}>
            {resource.key === "media" ? "Upload media" : `New ${resource.singular}`}
          </Link>
        }
      />

      {query.deleted && (
        <p role="status" className="mb-6 border border-copper/60 px-4 py-3 text-sm">
          Deleted.
        </p>
      )}

      <form className="mb-6 flex max-w-md gap-2" role="search">
        {parentId && resource.parent && <input type="hidden" name={resource.parent.param} value={parentId} />}
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder={`Search ${resource.label.toLowerCase()}…`} className="w-full border border-line bg-ink px-3 py-2 text-sm focus:border-copper focus:outline-none" />
        <button type="submit" className="border border-line px-4 text-sm text-silver hover:text-bone">Search</button>
      </form>

      {error ? (
        <p role="alert" className="border border-signal/60 px-4 py-3 text-sm">
          Could not load {resource.label.toLowerCase()}: {error.code === "42P01" || error.code === "PGRST205" ? "the table does not exist yet. Apply the Supabase migration." : error.message}
        </p>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-3xl">Nothing here yet.</p>
          <Link href={newHref} className="mt-4 inline-block text-sm text-copper underline underline-offset-4">
            {resource.key === "media" ? "Upload the first file" : `Create the first ${resource.singular}`}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-mist">
                {resource.key === "media" && <th scope="col" className="w-16 py-3 pr-4 font-normal"><span className="sr-only">Preview</span></th>}
                {resource.list.map((c) => (
                  <th key={c.name} scope="col" className="py-3 pr-4 font-normal">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const href = `/studio/${resource.key}/${row.id}`;
                const thumb = resource.key === "media" && row.kind === "image" && row.storage_path ? publicStorageUrl(String(row.storage_path)) : null;
                return (
                  <tr key={String(row.id)} className="border-b border-line hover:bg-charcoal">
                    {resource.key === "media" && (
                      <td className="py-2 pr-4">
                        <div className="relative h-12 w-12 overflow-hidden bg-ink">
                          {thumb ? <Image src={thumb} alt="" fill sizes="48px" className="object-cover" unoptimized /> : <span className="flex h-full items-center justify-center font-mono text-[0.6rem] uppercase text-mist">{String(row.kind)}</span>}
                        </div>
                      </td>
                    )}
                    {resource.list.map((c, i) => (
                      <td key={c.name} className="py-3 pr-4 align-middle">
                        {i === 0 ? (
                          <Link href={href} className="text-bone hover:text-copper">
                            <Cell column={c} value={row[c.name]} />
                          </Link>
                        ) : (
                          <Cell column={c} value={row[c.name]} />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
