import { saveSettings } from "../../actions";
import { StudioHeader } from "@/components/studio/PageHeader";
import { RecordForm } from "@/components/studio/RecordForm";
import { seedSettings } from "@/lib/data/seed";
import { requireStaff } from "@/lib/studio/auth";
import { loadChoices } from "@/lib/studio/choices";
import { toInputValue } from "@/lib/studio/parse";
import { settingsFields } from "@/lib/studio/resources";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const { db } = await requireStaff();
  const [{ data }, choices] = await Promise.all([
    db.from("ca_site_settings").select("*").eq("id", 1).maybeSingle(),
    loadChoices(db, settingsFields),
  ]);
  // Before the first save, start from the built-in content the site already shows.
  const row = (data ?? seedSettings) as unknown as Record<string, unknown>;
  const values = Object.fromEntries(settingsFields.map((f) => [f.name, toInputValue(f, row[f.name])]));

  return (
    <>
      <StudioHeader
        title="Site settings"
        description="Artist identity, homepage, artist story, Full Band details, contact links and SEO defaults. Empty story fields show a labelled placeholder on the site."
      />
      {!data && (
        <p className="mb-8 border border-line px-4 py-3 text-sm text-mist">
          Settings have not been saved to the database yet. The form shows the built-in content; saving stores it.
        </p>
      )}
      <RecordForm fields={settingsFields} values={values} choices={choices} action={saveSettings} submitLabel="Save settings" />
    </>
  );
}
