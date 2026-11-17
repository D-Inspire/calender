export interface CalendarEvent {
  id: string
  title: string
  /** ISO date, YYYY-MM-DD */
  start_date: string
  /** ISO date, YYYY-MM-DD (inclusive) */
  end_date: string
  /** HH:MM 24h, or null for all-day / untimed */
  start_time: string | null
  end_time: string | null
  /** hex color, e.g. #2B8CF4 */
  color: string
  description?: string
  all_day: boolean
}

export type RenderMode = "span" | "per-day"

/** A palette swatch used by the color picker. */
export interface Swatch {
  label: string
  value: string
}

export const EVENT_PALETTE: Swatch[] = [
  { label: "Blue", value: "#2B8CF4" },
  { label: "Pink", value: "#E75A7C" },
  { label: "Amber", value: "#FFD166" },
  { label: "Green", value: "#06D6A0" },
  { label: "Violet", value: "#7C6AF0" },
  { label: "Slate", value: "#64748B" },
]
