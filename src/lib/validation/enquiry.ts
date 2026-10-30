import { budgetRanges, enquiryTypeLabels } from "@/lib/data/labels";
import type { EnquiryType } from "@/lib/data/types";

export interface EnquiryInput {
  name: string;
  email: string;
  organisation: string | null;
  enquiry_type: EnquiryType;
  event_date: string | null;
  location: string | null;
  budget_range: string | null;
  message: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryInput | "consent" | "form", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Server-side validation; the same rules mirror the database constraints. */
export function validateEnquiry(
  form: FormData,
): { ok: true; data: EnquiryInput } | { ok: false; errors: EnquiryErrors } {
  const errors: EnquiryErrors = {};
  const name = text(form, "name");
  const email = text(form, "email").toLowerCase();
  const organisation = text(form, "organisation");
  const type = text(form, "enquiry_type");
  const eventDate = text(form, "event_date");
  const location = text(form, "location");
  const budget = text(form, "budget_range");
  const message = text(form, "message");

  if (!name) errors.name = "Please tell us your name.";
  else if (name.length > 160) errors.name = "That name is too long.";

  if (!email) errors.email = "An email address is needed so we can reply.";
  else if (!EMAIL.test(email) || email.length > 254) errors.email = "That email address doesn't look right.";

  if (organisation.length > 200) errors.organisation = "Please shorten the organisation name.";

  if (!(type in enquiryTypeLabels)) errors.enquiry_type = "Choose the type of enquiry.";

  if (eventDate) {
    if (!DATE.test(eventDate) || Number.isNaN(Date.parse(eventDate))) {
      errors.event_date = "Use a valid date.";
    }
  }

  if (location.length > 200) errors.location = "Please shorten the location.";

  if (budget && !(budgetRanges as readonly string[]).includes(budget)) {
    errors.budget_range = "Choose one of the budget ranges.";
  }

  if (message.length < 10) errors.message = "Tell us a little more (at least 10 characters).";
  else if (message.length > 5000) errors.message = "Please keep the message under 5,000 characters.";

  if (form.get("consent") !== "on") {
    errors.consent = "Please confirm we may use these details to reply.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name,
      email,
      organisation: organisation || null,
      enquiry_type: type as EnquiryType,
      event_date: eventDate || null,
      location: location || null,
      budget_range: budget || null,
      message,
    },
  };
}
