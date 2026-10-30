"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/(site)/book/actions";
import { budgetRanges, enquiryTypeLabels, options } from "@/lib/data/labels";

const field =
  "w-full border-b border-smoke bg-transparent py-3 text-base text-bone placeholder:text-smoke focus:border-copper focus:outline-none aria-[invalid=true]:border-signal";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-mist">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-signal">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingForm() {
  const params = useSearchParams();
  const requested = params.get("type");
  const initialType = requested && requested in enquiryTypeLabels ? requested : "";
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: "idle" });
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const v = state.values ?? {};
  const e = state.errors ?? {};

  useEffect(() => {
    // Written straight to the DOM: it only feeds the spam timing check.
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-line p-8 md:p-12 focus:outline-none">
        <p className="eyebrow text-copper">Enquiry received</p>
        <p className="mt-4 font-display text-4xl leading-tight md:text-5xl">Thank you. Your message is with us.</p>
        <p className="mt-6 max-w-lg text-silver">
          Every enquiry is reviewed personally. You will hear back by email; nothing is booked or
          confirmed until it has been agreed in writing.
        </p>
        <Link href="/sound" className="mt-8 inline-block text-sm text-bone underline decoration-copper underline-offset-4">
          Explore the sound while you wait
        </Link>
      </div>
    );
  }

  const describedBy = (key: keyof typeof e) => (e[key] ? `${key}-error` : undefined);

  return (
    <form action={action} noValidate className="space-y-8" aria-describedby={e.form ? "form-error" : undefined}>
      {state.status === "error" && (
        <div ref={statusRef} tabIndex={-1} id="form-error" role="alert" className="border border-signal/60 p-4 text-sm text-bone focus:outline-none">
          {e.form ?? "Please check the highlighted fields."}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Field id="name" label="Name *" error={e.name}>
          <input id="name" name="name" autoComplete="name" required maxLength={160} defaultValue={v.name} aria-invalid={Boolean(e.name)} aria-describedby={describedBy("name")} className={field} />
        </Field>
        <Field id="email" label="Email *" error={e.email}>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={v.email} aria-invalid={Boolean(e.email)} aria-describedby={describedBy("email")} className={field} />
        </Field>
        <Field id="organisation" label="Organisation" error={e.organisation}>
          <input id="organisation" name="organisation" autoComplete="organization" maxLength={200} defaultValue={v.organisation} aria-invalid={Boolean(e.organisation)} className={field} />
        </Field>
        <Field id="enquiry_type" label="Enquiry type *" error={e.enquiry_type}>
          <select id="enquiry_type" name="enquiry_type" required defaultValue={v.enquiry_type ?? initialType} aria-invalid={Boolean(e.enquiry_type)} aria-describedby={describedBy("enquiry_type")} className={`${field} [&>option]:bg-ink`}>
            <option value="" disabled>
              Choose…
            </option>
            {options(enquiryTypeLabels).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="event_date" label="Event or project date" error={e.event_date}>
          <input id="event_date" name="event_date" type="date" defaultValue={v.event_date} aria-invalid={Boolean(e.event_date)} className={`${field} [color-scheme:dark]`} />
        </Field>
        <Field id="location" label="Location" error={e.location} hint="City, venue or 'remote'">
          <input id="location" name="location" maxLength={200} defaultValue={v.location} aria-invalid={Boolean(e.location)} className={field} />
        </Field>
        <Field id="budget_range" label="Budget range (optional)" error={e.budget_range}>
          <select id="budget_range" name="budget_range" defaultValue={v.budget_range ?? ""} aria-invalid={Boolean(e.budget_range)} className={`${field} [&>option]:bg-ink`}>
            <option value="">Prefer not to say</option>
            {budgetRanges.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="message" label="Message *" error={e.message} hint="The event, the room, the audience, the idea.">
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={7} defaultValue={v.message} aria-invalid={Boolean(e.message)} aria-describedby={describedBy("message")} className={`${field} resize-y`} />
      </Field>

      {/* Spam traps: hidden from people and assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="started_at" defaultValue="" />

      <div>
        <label className="flex items-start gap-3 text-sm text-silver">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[var(--color-copper)]" aria-invalid={Boolean(e.consent)} aria-describedby={describedBy("consent")} />
          <span>I agree that these details may be used to respond to this enquiry. They are not shared or used for marketing.</span>
        </label>
        {e.consent && (
          <p id="consent-error" role="alert" className="mt-2 text-xs text-signal">
            {e.consent}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-bone px-8 py-4 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-copper disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-xs text-mist">Enquiries are reviewed personally. Sending does not confirm a booking.</p>
      </div>
    </form>
  );
}
