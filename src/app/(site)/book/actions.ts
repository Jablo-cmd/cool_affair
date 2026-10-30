"use server";

import { getPublicClient } from "@/lib/supabase/public";
import { validateEnquiry, type EnquiryErrors } from "@/lib/validation/enquiry";

export interface EnquiryState {
  status: "idle" | "error" | "success";
  errors?: EnquiryErrors;
  values?: Record<string, string>;
}

const MIN_FILL_MS = 2500;

export async function submitEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  const values = Object.fromEntries(
    [...form.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")),
  ) as Record<string, string>;

  // Spam traps: a hidden field people never fill, and a minimum fill time.
  // Bots get a quiet "success" so they learn nothing.
  const startedAt = Number(form.get("started_at"));
  if (form.get("website") || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
    return { status: "success" };
  }

  const result = validateEnquiry(form);
  if (!result.ok) return { status: "error", errors: result.errors, values };

  const db = getPublicClient();
  if (!db) {
    return {
      status: "error",
      values,
      errors: {
        form: "Online enquiries are not connected yet. Please use the email address on this page.",
      },
    };
  }

  // Insert only: RLS lets the public create enquiries but never read them.
  const { error } = await db.from("ca_enquiries").insert({ ...result.data, status: "new" });
  if (error) {
    console.error("[enquiry] insert failed", error);
    return {
      status: "error",
      values,
      errors: { form: "Your enquiry could not be sent just now. Please try again in a moment." },
    };
  }

  return { status: "success" };
}
