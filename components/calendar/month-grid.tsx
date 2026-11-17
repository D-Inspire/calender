"use client"

import type { CalendarEvent, RenderMode } from "@/lib/calendar/types"
import type { GridCell } from "@/lib/calendar/date-utils"
import { WEEKDAYS_SHORT, WEEKDAYS_NARROW, todayISO } from "@/lib/calendar/date-utils"
import { layoutWeek, hiddenCountsByCol, eventsForDay } from "@/lib/calendar/layout"
import { SpanBar } from "./span-bar"
import { EventChip } from "./event-chip"
import { cn } from "@/lib/utils"

const HEADER_H = 28
const LANE_H = 22

interface MonthGridProps {
  grid: GridCell[][]
  events: CalendarEvent[]
  renderMode: RenderMode
  maxLanes: number
  selectedIso: string | null
  pulseDates: Set<string>
  onSelectDay: (iso: string) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthGrid({
  grid,
  events,
  renderMode,
  maxLanes,
  selectedIso,
  pulseDates,
  onSelectDay,
  onEventClick,
}: MonthGridProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{WEEKDAYS_NARROW[i]}</span>
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="divide-y divide-border">
        {grid.map((week, wi) => (
          <WeekRow
            key={wi}
            week={week}
            events={events}
            renderMode={renderMode}
            maxLanes={maxLanes}
            selectedIso={selectedIso}
            pulseDates={pulseDates}
            onSelectDay={onSelectDay}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}

function WeekRow({
  week,
  events,
  renderMode,
  maxLanes,
  selectedIso,
  pulseDates,
  onSelectDay,
  onEventClick,
}: {
  week: GridCell[]
  events: CalendarEvent[]
  renderMode: RenderMode
  maxLanes: number
  selectedIso: string | null
  pulseDates: Set<string>
  onSelectDay: (iso: string) => void
  onEventClick: (event: CalendarEvent) => void
}) {
  const segments = renderMode === "span" ? layoutWeek(events, week) : []
  const visibleSegments = segments.filter((s) => s.lane < maxLanes)
  const spanHidden = renderMode === "span" ? hiddenCountsByCol(segments, maxLanes) : []

  const minHeight = HEADER_H + maxLanes * LANE_H + 20

  return (
    <div className="relative grid grid-cols-7">
      {week.map((cell, ci) => {
        const dayEvents = renderMode === "per-day" ? eventsForDay(events, cell.iso) : []
        const perDayVisible = dayEvents.slice(0, maxLanes)
        const hiddenCount =
          renderMode === "span" ? spanHidden[ci] : dayEvents.length - perDayVisible.length

        return (
          <DayCell
            key={cell.iso}
            cell={cell}
            selected={selectedIso === cell.iso}
            pulse={pulseDates.has(cell.iso)}
            minHeight={minHeight}
            onSelect={() => onSelectDay(cell.iso)}
          >
            {renderMode === "per-day" ? (
              <div className="mt-1 flex flex-col gap-0.5">
                {perDayVisible.map((e) => (
                  <EventChip key={e.id} event={e} onClick={onEventClick} />
                ))}
              </div>
            ) : null}

            {hiddenCount > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectDay(cell.iso)
                }}
                className="absolute inset-x-1 bottom-1 rounded-md bg-muted px-1.5 py-0.5 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                +{hiddenCount} more
              </button>
            ) : null}
          </DayCell>
        )
      })}

      {/* Span overlay: bars drawn across the whole week row */}
      {renderMode === "span" ? (
        <div
          className="pointer-events-none absolute inset-x-0 grid grid-cols-7"
          style={{
            top: HEADER_H,
            gridTemplateRows: `repeat(${maxLanes}, ${LANE_H}px)`,
          }}
        >
          {visibleSegments.map((seg) => (
            <div
              key={`${seg.event.id}-${seg.startCol}`}
              className="pointer-events-auto px-0.5 py-[2px]"
              style={{
                gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                gridRow: seg.lane + 1,
              }}
            >
              <SpanBar segment={seg} onClick={onEventClick} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function DayCell({
  cell,
  selected,
  pulse,
  minHeight,
  onSelect,
  children,
}: {
  cell: GridCell
  selected: boolean
  pulse: boolean
  minHeight: number
  onSelect: () => void
  children: React.ReactNode
}) {
  const isPast = cell.iso < todayISO()

  return (
    <div
      role="gridcell"
      tabIndex={isPast ? -1 : 0}
      aria-selected={selected}
      aria-disabled={isPast}
      aria-label={`${cell.iso}${isPast ? " (past date)" : ""}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{ minHeight }}
      className={cn(
        "relative border-r border-border px-1 pt-1 text-left outline-none transition-colors last:border-r-0",
        isPast
          ? "bg-muted/40 opacity-45 cursor-not-allowed select-none"
          : "cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        !isPast && (cell.inMonth ? "bg-card hover:bg-muted/50" : "bg-muted/30 hover:bg-muted/50"),
        selected && "ring-2 ring-inset ring-ring",
        pulse && "animate-cell-pulse",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <span
          className={cn(
            "grid size-6 place-items-center rounded-full text-xs font-medium tabular-nums",
            cell.isToday && "bg-primary text-primary-foreground font-semibold",
            !cell.isToday && isPast && "text-muted-foreground/60 line-through decoration-muted-foreground/40",
            !cell.isToday && !isPast && cell.inMonth && "text-foreground",
            !cell.isToday && !isPast && !cell.inMonth && "text-muted-foreground/60",
          )}
        >
          {cell.day}
        </span>
      </div>
      {children}
    </div>
  )
}

