/**
 * All calendar math works on local dates represented as YYYY-MM-DD strings to
 * avoid timezone drift. Date objects are only used transiently and always at
 * local noon so DST transitions never shift the calendar day.
 */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const WEEKDAYS_NARROW = ["S", "M", "T", "W", "T", "F", "S"]

/** Build a local Date at noon from a YYYY-MM-DD string. */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

/** Format a Date to a local YYYY-MM-DD string. */
export function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISO(new Date())
}

/** Current month key, YYYY-MM. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function currentMonthKey(): string {
  return todayISO().slice(0, 7)
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export function addMonthsToKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, m - 1 + delta, 1, 12)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}

export function dayOfMonth(iso: string): number {
  return Number(iso.slice(8, 10))
}

/** Human day label, e.g. "Friday, August 28, 2026". */
export function fullDayLabel(iso: string): string {
  const d = parseISO(iso)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/** Short day label, e.g. "Aug 28". */
export function shortDayLabel(iso: string): string {
  const [, m, d] = iso.split("-").map(Number)
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`
}

/** Inclusive range label, e.g. "Aug 28–30" or "Jul 30 – Aug 2". */
export function rangeLabel(start: string, end: string): string {
  if (start === end) return shortDayLabel(start)
  const sameMonth = start.slice(0, 7) === end.slice(0, 7)
  if (sameMonth) {
    return `${shortDayLabel(start)}\u2013${dayOfMonth(end)}`
  }
  return `${shortDayLabel(start)} \u2013 ${shortDayLabel(end)}`
}

/** 12h time label from HH:MM, e.g. "10:00 AM". */
export function timeLabel(time: string | null): string | null {
  if (!time) return null
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

export interface GridCell {
  iso: string
  day: number
  inMonth: boolean
  isToday: boolean
}

/**
 * Build a 6-week (42-cell) grid for a month, weeks starting on Sunday.
 * Returned as 6 rows of 7 cells.
 */
export function buildMonthGrid(key: string): GridCell[][] {
  const [y, m] = key.split("-").map(Number)
  const first = new Date(y, m - 1, 1, 12)
  const startOffset = first.getDay() // 0 = Sunday
  const gridStart = new Date(y, m - 1, 1 - startOffset, 12)
  const today = todayISO()

  const rows: GridCell[][] = []
  for (let w = 0; w < 6; w++) {
    const row: GridCell[] = []
    for (let d = 0; d < 7; d++) {
      const cur = new Date(gridStart)
      cur.setDate(gridStart.getDate() + w * 7 + d)
      const iso = toISO(cur)
      row.push({
        iso,
        day: cur.getDate(),
        inMonth: cur.getMonth() === m - 1,
        isToday: iso === today,
      })
    }
    rows.push(row)
  }
  return rows
}

/** True when `iso` falls within [start, end] inclusive. */
export function isWithin(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end
}

/** Current local system time as "HH:MM" in 24h format. */
export function currentTimeHHMM(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, "0")
  const m = String(now.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

/** True when `iso` is strictly before today's date. */
export function isPastDate(iso: string): boolean {
  return iso < todayISO()
}

/**
 * True when the given date and time (HH:MM or null) is strictly in the past.
 * For today, an untimed/all-day event is allowed.
 */
export function isPastDateTime(dateIso: string, timeStr: string | null): boolean {
  const today = todayISO()
  if (dateIso < today) return true
  if (dateIso > today) return false
  if (!timeStr) return false
  return timeStr < currentTimeHHMM()
}

/**
 * Returns default start and end times that are valid for the given start date.
 * If today, defaults to the current/next available time slot.
 */
export function getValidDefaultTimes(dateIso: string): { start_time: string; end_time: string } {
  const today = todayISO()
  if (dateIso > today) {
    return { start_time: "09:00", end_time: "10:00" }
  }
  const now = new Date()
  let h = now.getHours()
  let m = Math.ceil(now.getMinutes() / 15) * 15
  if (m >= 60) {
    h = (h + 1) % 24
    m = 0
  }
  const startHStr = String(h).padStart(2, "0")
  const startMStr = String(m).padStart(2, "0")
  const startTime = `${startHStr}:${startMStr}`

  let endH = h + 1
  let endM = m
  if (endH >= 24) {
    endH = 23
    endM = 59
  }
  const endHStr = String(endH).padStart(2, "0")
  const endMStr = String(endM).padStart(2, "0")
  const endTime = `${endHStr}:${endMStr}`

  return { start_time: startTime, end_time: endTime }
}

