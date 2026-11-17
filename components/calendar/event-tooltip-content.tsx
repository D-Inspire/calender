import type { CalendarEvent } from "@/lib/calendar/types"
import { rangeLabel, timeLabel } from "@/lib/calendar/date-utils"
import { Pencil } from "lucide-react"

export function EventTooltipContent({
  event,
  onEdit,
}: {
  event: CalendarEvent
  onEdit?: (event: CalendarEvent) => void
}) {
  const start = timeLabel(event.start_time)
  const end = timeLabel(event.end_time)
  const timeText = event.all_day || !start ? "All day" : end ? `${start} – ${end}` : start

  return (
    <div className="space-y-2 text-left min-w-48">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: event.color }}
            aria-hidden="true"
          />
          <p className="text-sm font-semibold leading-tight text-foreground">{event.title}</p>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(event)
            }}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Edit event"
          >
            <Pencil className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>📅</span>
          <span>{rangeLabel(event.start_date, event.end_date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🕐</span>
          <span>{timeText}</span>
        </div>
      </div>

      {event.description ? (
        <p className="border-t border-border/60 pt-1.5 text-xs text-muted-foreground text-pretty max-w-60">
          {event.description}
        </p>
      ) : null}
    </div>
  )
}

