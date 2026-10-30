import { MediaUploader } from "@/components/studio/MediaUploader";
import { StudioHeader } from "@/components/studio/PageHeader";
import { supabaseKey, supabaseUrl } from "@/lib/env";
import { requireStaff } from "@/lib/studio/auth";
import { resources } from "@/lib/studio/resources";

export const metadata = { title: "Upload media" };

export default async function NewMedia() {
  await requireStaff();
  return (
    <>
      <StudioHeader
        title="Upload media"
        description="Record where every file came from and who allowed its use. Nothing appears on the public site until it is approved."
        crumbs={[{ href: "/studio/media", label: "Media & provenance" }]}
      />
      <MediaUploader fields={resources.media.fields} supabaseUrl={supabaseUrl!} supabaseKey={supabaseKey!} />
    </>
  );
}
