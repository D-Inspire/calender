import { WEEKDAYS_SHORT, WEEKDAYS_NARROW } from "@/lib/calendar/date-utils"

export function GridSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{WEEKDAYS_NARROW[i]}</span>
          </div>
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, w) => (
          <div key={w} className="grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, d) => (
              <div
                key={d}
                className="min-h-24 border-r border-border p-2 last:border-r-0"
              >
                <div className="mb-2 size-5 rounded-full bg-muted animate-pulse" />
                {(w + d) % 3 === 0 ? (
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
