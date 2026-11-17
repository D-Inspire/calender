"use client"

import { Pencil, Plus, CalendarPlus } from "lucide-react"
import { Drawer } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import type { CalendarEvent } from "@/lib/calendar/types"
import { eventsForDay } from "@/lib/calendar/layout"
import { fullDayLabel, rangeLabel, timeLabel, isPastDate } from "@/lib/calendar/date-utils"
import { hexToRgba, darken } from "@/lib/calendar/colors"

interface DayDrawerProps {
  open: boolean
  date: string | null
  events: CalendarEvent[]
  onClose: () => void
  onAdd: (date: string) => void
  onEdit: (event: CalendarEvent) => void
}

export function DayDrawer({ open, date, events, onClose, onAdd, onEdit }: DayDrawerProps) {
  const dayEvents = date ? eventsForDay(events, date) : []
  const isPast = date ? isPastDate(date) : false

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={date ? fullDayLabel(date) : ""}
      subtitle={
        dayEvents.length
          ? `${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`
          : undefined
      }
      footer={
        date ? (
          isPast ? (
            <div className="w-full rounded-lg bg-muted/60 py-2.5 text-center text-xs font-medium text-muted-foreground">
              Past dates cannot be selected for event creation.
            </div>
          ) : (
            <Button className="w-full" size="sm" onClick={() => onAdd(date)}>
              <Plus />
              Add event
            </Button>
          )
        ) : null
      }
    >
      {dayEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
          <CalendarPlus className="size-6 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No events for this day</p>
            <p className="text-xs text-muted-foreground">Add one now.</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {dayEvents.map((event) => {
            const start = timeLabel(event.start_time)
            const end = timeLabel(event.end_time)
            const timeText =
              event.all_day || !start ? "All day" : end ? `${start} – ${end}` : start
            return (
              <li key={event.id}>
                <div
                  className="flex items-start gap-3 rounded-xl border border-border p-3"
                  style={{
                    backgroundColor: hexToRgba(event.color, 0.08),
                    borderLeft: `4px solid ${darken(event.color, 0.15)}`,
                  }}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight text-balance">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {rangeLabel(event.start_date, event.end_date)} · {timeText}
                    </p>
                    {event.description ? (
                      <p className="text-xs text-muted-foreground text-pretty">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onEdit(event)}
                    aria-label={`Edit ${event.title}`}
                  >
                    <Pencil />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Drawer>
  )
}
