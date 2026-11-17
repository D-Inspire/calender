"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { WeekSegment } from "@/lib/calendar/layout"
import { readableText, darken } from "@/lib/calendar/colors"
import { timeLabel } from "@/lib/calendar/date-utils"
import { HoverTooltip } from "@/components/ui/hover-tooltip"
import { EventTooltipContent } from "./event-tooltip-content"
import type { CalendarEvent } from "@/lib/calendar/types"
import { cn } from "@/lib/utils"

interface SpanBarProps {
  segment: WeekSegment
  onClick?: (event: CalendarEvent) => void
}

/**
 * A continuous span bar for one week row. Squares off the edge where the event
 * continues into an adjacent week/month and shows a chevron continuation marker.
 */
export function SpanBar({ segment, onClick }: SpanBarProps) {
  const { event, continuesLeft, continuesRight } = segment
  const fg = readableText(event.color)
  const time = timeLabel(event.start_time)
  const isMultiDay = event.end_date > event.start_date

  return (
    <HoverTooltip content={<EventTooltipContent event={event} onEdit={onClick} />} className="h-full w-full block pointer-events-auto">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(event)
        }}
        className={cn(
          "flex h-full w-full items-center gap-1 overflow-hidden px-1.5 text-left transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-events-auto cursor-pointer",
          continuesLeft ? "rounded-l-none pl-0.5" : "rounded-l-md",
          continuesRight ? "rounded-r-none pr-0.5" : "rounded-r-md",
        )}
        style={{
          backgroundColor: event.color,
          color: fg,
          // slightly darker inner edge keeps same-colored neighbors distinct
          boxShadow: `inset 2px 0 0 ${darken(event.color, 0.18)}`,
        }}
      >
        {continuesLeft ? <ChevronLeft className="size-3 shrink-0 opacity-80 pointer-events-none" /> : null}
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium leading-tight pointer-events-none">
          {!isMultiDay && !event.all_day && time ? (
            <span className="tabular-nums opacity-80 pointer-events-none">{time} </span>
          ) : null}
          {event.title}
        </span>
        {continuesRight ? <ChevronRight className="size-3 shrink-0 opacity-80 pointer-events-none" /> : null}
      </button>
    </HoverTooltip>
  )
}
