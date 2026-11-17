import type { CalendarEvent } from "./types"
import type { GridCell } from "./date-utils"

/** Max lanes drawn as span bars before overflow collapses into "+N more". */
export const MAX_LANES_DESKTOP = 3
export const MAX_LANES_MOBILE = 2

/** A positioned span segment within a single week row. */
export interface WeekSegment {
  event: CalendarEvent
  /** 0-6 column where the bar starts in this week */
  startCol: number
  /** 0-6 column where the bar ends in this week (inclusive) */
  endCol: number
  /** event continues into the previous week / off the left edge */
  continuesLeft: boolean
  /** event continues into the next week / off the right edge */
  continuesRight: boolean
  /** vertical lane index (0-based) */
  lane: number
}

function dayIndexInWeek(iso: string, week: GridCell[]): number {
  return week.findIndex((c) => c.iso === iso)
}

/**
 * Sort events for stable stacking: longer / earlier events float to the top
 * lanes so multi-day spans stay readable above short single-day chips.
 */
function sortForLanes(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    if (a.start_date !== b.start_date) return a.start_date < b.start_date ? -1 : 1
    const aLen = a.end_date.localeCompare(a.start_date)
    const bLen = b.end_date.localeCompare(b.start_date)
    // longer span first
    const aSpan = a.end_date > a.start_date ? 1 : 0
    const bSpan = b.end_date > b.start_date ? 1 : 0
    if (aSpan !== bSpan) return bSpan - aSpan
    void aLen
    void bLen
    return a.id.localeCompare(b.id)
  })
}

/**
 * Compute lane-assigned span segments for a single week row.
 * Greedy first-fit lane packing keyed on column overlap.
 */
export function layoutWeek(events: CalendarEvent[], week: GridCell[]): WeekSegment[] {
  const weekStart = week[0].iso
  const weekEnd = week[6].iso

  const intersecting = sortForLanes(
    events.filter((e) => e.start_date <= weekEnd && e.end_date >= weekStart),
  )

  const laneEnds: number[] = [] // last occupied column per lane
  const segments: WeekSegment[] = []

  for (const event of intersecting) {
    const rawStart = event.start_date < weekStart ? 0 : dayIndexInWeek(event.start_date, week)
    const rawEnd = event.end_date > weekEnd ? 6 : dayIndexInWeek(event.end_date, week)
    const startCol = rawStart < 0 ? 0 : rawStart
    const endCol = rawEnd < 0 ? 6 : rawEnd

    let lane = 0
    while (lane < laneEnds.length && laneEnds[lane] >= startCol) lane++
    laneEnds[lane] = endCol

    segments.push({
      event,
      startCol,
      endCol,
      continuesLeft: event.start_date < weekStart,
      continuesRight: event.end_date > weekEnd,
      lane,
    })
  }

  return segments
}

/**
 * For a given week + its segments, compute how many events touch each day
 * column but sit in a hidden lane (lane >= maxLanes). Used for the "+N more"
 * overflow pill per day cell.
 */
export function hiddenCountsByCol(segments: WeekSegment[], maxLanes: number): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0]
  for (const seg of segments) {
    if (seg.lane < maxLanes) continue
    for (let c = seg.startCol; c <= seg.endCol; c++) counts[c]++
  }
  return counts
}

/** All events that cover a given ISO day, sorted for the drawer / per-day list. */
export function eventsForDay(events: CalendarEvent[], iso: string): CalendarEvent[] {
  return events
    .filter((e) => iso >= e.start_date && iso <= e.end_date)
    .sort((a, b) => {
      // multi-day and all-day first
      const aMulti = a.end_date > a.start_date || a.all_day ? 0 : 1
      const bMulti = b.end_date > b.start_date || b.all_day ? 0 : 1
      if (aMulti !== bMulti) return aMulti - bMulti
      const at = a.start_time ?? "00:00"
      const bt = b.start_time ?? "00:00"
      if (at !== bt) return at < bt ? -1 : 1
      return a.title.localeCompare(b.title)
    })
}
