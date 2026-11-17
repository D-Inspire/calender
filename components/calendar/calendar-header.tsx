"use client"

import { ChevronLeft, ChevronRight, Plus, LayoutGrid, Rows3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RenderMode } from "@/lib/calendar/types"
import { monthLabel } from "@/lib/calendar/date-utils"
import { cn } from "@/lib/utils"

interface CalendarHeaderProps {
  monthKey: string
  renderMode: RenderMode
  disabled?: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAdd: () => void
  onRenderModeChange: (mode: RenderMode) => void
}

export function CalendarHeader({
  monthKey,
  renderMode,
  disabled,
  onPrev,
  onNext,
  onToday,
  onAdd,
  onRenderModeChange,
}: CalendarHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onPrev}
            disabled={disabled}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onNext}
            disabled={disabled}
            aria-label="Next month"
          >
            <ChevronRight />
          </Button>
        </div>
        <h1 className="min-w-44 text-xl font-semibold tracking-tight text-balance">
          {monthLabel(monthKey)}
        </h1>
        <Button variant="ghost" size="sm" onClick={onToday} disabled={disabled}>
          Today
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="inline-flex items-center rounded-lg border border-border bg-card p-0.5"
          role="group"
          aria-label="Event render mode"
        >
          <ModeButton
            active={renderMode === "span"}
            onClick={() => onRenderModeChange("span")}
            icon={<Rows3 className="size-3.5" />}
            label="Spans"
          />
          <ModeButton
            active={renderMode === "per-day"}
            onClick={() => onRenderModeChange("per-day")}
            icon={<LayoutGrid className="size-3.5" />}
            label="Per-day"
          />
        </div>
        <Button size="sm" onClick={onAdd} disabled={disabled}>
          <Plus />
          Add event
        </Button>
      </div>
    </header>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
