"use client"

import type { CalendarEvent } from "@/lib/calendar/types"
import { hexToRgba, darken } from "@/lib/calendar/colors"
import { timeLabel } from "@/lib/calendar/date-utils"
import { HoverTooltip } from "@/components/ui/hover-tooltip"
import { EventTooltipContent } from "./event-tooltip-content"
import { cn } from "@/lib/utils"

interface EventChipProps {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
  /** compact single-line chip for dense cells */
  compact?: boolean
}

/**
 * Per-day chip: tinted background, darker left border, colored dot. Used in
 * per-day render mode and inside cells for single-day events.
 */
export function EventChip({ event, onClick, compact = true }: EventChipProps) {
  const time = timeLabel(event.start_time)

  return (
    <HoverTooltip content={<EventTooltipContent event={event} onEdit={onClick} />} className="w-full block pointer-events-auto">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(event)
        }}
        className={cn(
          "flex w-full items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-0.5 text-left transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-events-auto cursor-pointer",
          compact ? "" : "py-1",
        )}
        style={{
          backgroundColor: hexToRgba(event.color, 0.16),
          borderLeft: `3px solid ${darken(event.color)}`,
        }}
      >
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium leading-tight text-foreground pointer-events-none">
          {!event.all_day && time ? <span className="tabular-nums text-muted-foreground pointer-events-none">{time} </span> : null}
          {event.title}
        </span>
      </button>
    </HoverTooltip>
  )
}
