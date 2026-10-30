"use client";

import { useActionState, useRef, useState } from "react";
import { registerMedia, type FormState } from "@/app/studio/actions";
import { MEDIA_BUCKET } from "@/lib/env";
import { slugify } from "@/lib/format";
import type { Field } from "@/lib/studio/resources";
import { getBrowserClient } from "@/lib/supabase/browser";
import { FieldInput } from "./FieldInput";
import { button, input, submitWithoutReset } from "./ui";

const ACCEPT: Record<string, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  audio: "audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/ogg,audio/flac",
  video: "video/mp4,video/webm",
};

async function imageSize(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

// Two steps: the browser uploads straight to Supabase Storage (RLS: staff only),
// then the Server Action records the asset with its provenance. If recording
// fails, the action removes the uploaded file again.
export function MediaUploader({
  fields,
  supabaseUrl,
  supabaseKey,
}: {
  fields: Field[];
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [kind, setKind] = useState("image");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState(
    async (prev: FormState, form: FormData): Promise<FormState> => {
      setUploadError(null);
      const file = form.get("file");
      form.delete("file");
      if (file instanceof File && file.size > 0) {
        if (file.size > 50 * 1024 * 1024) {
          setUploadError("Files must be 50 MB or smaller.");
          return { status: "error" };
        }
        setUploading(true);
        const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
        const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
        const path = `${kind}/${new Date().getFullYear()}/${crypto.randomUUID().slice(0, 8)}-${base}${ext ? `.${ext}` : ""}`;
        const db = getBrowserClient(supabaseUrl, supabaseKey);
        const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, file, {
          contentType: file.type || undefined,
          cacheControl: "31536000",
          upsert: false,
        });
        setUploading(false);
        if (error) {
          setUploadError(`Upload failed: ${error.message}`);
          return { status: "error" };
        }
        form.set("storage_path", path);
        if (kind === "image") {
          const size = await imageSize(file);
          if (size) {
            form.set("width", String(size.width));
            form.set("height", String(size.height));
          }
        }
      }
      form.set("kind", kind);
      return registerMedia(prev, form);
    },
    { status: "idle" } as FormState,
  );

  const errors = state.errors ?? {};
  const busy = uploading || pending;

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="space-y-10" noValidate>
      {(state.message || uploadError) && (
        <p role="alert" className="border border-signal/60 px-4 py-3 text-sm">
          {uploadError ?? state.message}
        </p>
      )}

      <fieldset className="border-t border-line pt-6">
        <legend className="eyebrow mb-6 pr-3 text-bone">File</legend>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="kind" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-mist">
              Kind <span className="text-copper">*</span>
            </label>
            <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)} className={input}>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label htmlFor="file" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-mist">
              Upload
            </label>
            <input
              ref={fileRef}
              id="file"
              name="file"
              type="file"
              accept={ACCEPT[kind]}
              aria-invalid={Boolean(errors.file)}
              className={`${input} file:mr-3 file:border-0 file:bg-charcoal file:px-3 file:py-1 file:text-bone`}
            />
            {errors.file ? (
              <p role="alert" className="mt-1.5 text-xs text-signal">{errors.file}</p>
            ) : (
              <p className="mt-1.5 text-xs text-mist">Up to 50 MB. Or leave empty and give an external URL below.</p>
            )}
          </div>
        </div>
      </fieldset>

      {["Asset", "Provenance"].map((group) => (
        <fieldset key={group} className="border-t border-line pt-6">
          <legend className="eyebrow mb-6 pr-3 text-bone">{group}</legend>
          <div className="grid gap-6 md:grid-cols-2">
            {fields
              .filter((f) => f.group === group)
              .map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={field.name === "permission" ? "pending" : field.name === "status" ? "pending_review" : field.type === "boolean" ? false : ""}
                  error={errors[field.name]}
                />
              ))}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-line bg-graphite/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <button type="submit" disabled={busy} className={button}>
          {uploading ? "Uploading…" : pending ? "Recording…" : "Upload & record"}
        </button>
        <p className="text-xs text-mist">New media stays hidden until it is approved.</p>
      </div>
    </form>
  );
}
