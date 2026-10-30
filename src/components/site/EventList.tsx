import { eventFormatLabels } from "@/lib/data/labels";
import type { LiveEvent } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

export function EventList({ events, past }: { events: LiveEvent[]; past?: boolean }) {
  return (
    <ol className="border-t border-line">
      {events.map((event) => (
        <li
          key={event.id}
          id={event.slug}
          className="grid gap-3 border-b border-line py-6 md:grid-cols-12 md:items-baseline md:gap-6"
        >
          <time
            dateTime={event.event_date ?? undefined}
            className={`font-mono text-xs uppercase tracking-[0.14em] md:col-span-3 ${past ? "text-mist" : "text-copper"}`}
          >
            {formatDate(event.event_date) ?? "Date to be confirmed"}
            {event.start_time ? ` · ${event.start_time}` : ""}
          </time>
          <div className="md:col-span-6">
            <p className="font-display text-3xl leading-tight">{event.title}</p>
            <p className="mt-1 text-sm text-silver">
              {[event.venue, event.city, event.country].filter(Boolean).join(", ")}
            </p>
            {event.description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{event.description}</p>}
          </div>
          <div className="flex items-center justify-between gap-4 md:col-span-3 md:flex-col md:items-end">
            <span className="eyebrow">{eventFormatLabels[event.format]}</span>
            {!past && event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-bone/30 px-4 py-2 text-xs tracking-wide hover:border-copper hover:text-copper"
              >
                Tickets ↗
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
