import { startTransition } from "react";
export const input =
  "w-full border border-line bg-ink px-3 py-2.5 text-sm text-bone placeholder:text-smoke focus:border-copper focus:outline-none aria-[invalid=true]:border-signal";

export const button =
  "inline-flex items-center justify-center gap-2 bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-copper disabled:cursor-wait disabled:opacity-60";

export const ghostButton =
  "inline-flex items-center justify-center gap-2 border border-line px-4 py-2 text-sm text-silver transition-colors hover:border-bone hover:text-bone";

export const dangerButton =
  "inline-flex items-center justify-center gap-2 border border-signal/50 px-4 py-2 text-sm text-signal transition-colors hover:bg-signal hover:text-ink";

/**
 * Submits through a transition instead of the form `action` prop, so React
 * does not reset the fields afterwards and a failed save keeps every edit.
 */
export function submitWithoutReset(dispatch: (form: FormData) => void) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(form));
  };
}
