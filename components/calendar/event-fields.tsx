"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { EVENT_PALETTE } from "@/lib/calendar/types"
import type { EventFormValues, FormErrors } from "@/lib/calendar/form"
import { readableText } from "@/lib/calendar/colors"
import { todayISO } from "@/lib/calendar/date-utils"
import { cn } from "@/lib/utils"

interface EventFieldsProps {
  values: EventFormValues
  errors: FormErrors
  onChange: (patch: Partial<EventFormValues>) => void
  /** hide description + finer details for the inline quick-create pane */
  compact?: boolean
  disabled?: boolean
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20"

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-foreground">
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export function EventFields({ values, errors, onChange, compact, disabled }: EventFieldsProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const today = todayISO()

  const isTodayStart = values.start_date === today
  const isTodayEnd = values.end_date === today

  const nextMinDate = new Date(now.getTime() + 60000)
  const nextMinTimeStr = `${String(nextMinDate.getHours()).padStart(2, "0")}:${String(
    nextMinDate.getMinutes(),
  ).padStart(2, "0")}`

  const minStartTime = isTodayStart ? nextMinTimeStr : undefined

  const minEndTime =
    values.start_date === values.end_date
      ? values.start_time || minStartTime
      : isTodayEnd
      ? nextMinTimeStr
      : undefined

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="event-title">Title</Label>
        <input
          id="event-title"
          className={inputClass}
          placeholder="e.g. Project kickoff"
          value={values.title}
          disabled={disabled}
          aria-invalid={!!errors.title}
          onChange={(e) => onChange({ title: e.target.value })}
          autoFocus
        />
        <FieldError message={errors.title} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="event-start">Start date</Label>
          <input
            id="event-start"
            type="date"
            className={inputClass}
            value={values.start_date}
            min={today}
            disabled={disabled}
            aria-invalid={!!errors.start_date}
            onChange={(e) => {
              const start = e.target.value
              onChange({
                start_date: start,
                end_date: values.end_date < start ? start : values.end_date,
              })
            }}
          />
          <FieldError message={errors.start_date} />
        </div>
        <div>
          <Label htmlFor="event-end">End date</Label>
          <input
            id="event-end"
            type="date"
            className={inputClass}
            value={values.end_date}
            min={values.start_date || today}
            disabled={disabled}
            aria-invalid={!!errors.end_date}
            onChange={(e) => onChange({ end_date: e.target.value })}
          />
          <FieldError message={errors.end_date} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border-border accent-primary"
          checked={values.all_day}
          disabled={disabled}
          onChange={(e) => onChange({ all_day: e.target.checked })}
        />
        All day
      </label>

      {!values.all_day ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="event-start-time">Start time</Label>
            <input
              id="event-start-time"
              type="time"
              className={inputClass}
              value={values.start_time}
              min={minStartTime}
              disabled={disabled}
              aria-invalid={!!errors.start_time}
              onChange={(e) => onChange({ start_time: e.target.value })}
            />
            <FieldError message={errors.start_time} />
          </div>
          <div>
            <Label htmlFor="event-end-time">End time</Label>
            <input
              id="event-end-time"
              type="time"
              className={inputClass}
              value={values.end_time}
              min={minEndTime}
              disabled={disabled}
              aria-invalid={!!errors.end_time}
              onChange={(e) => onChange({ end_time: e.target.value })}
            />
            <FieldError message={errors.end_time} />
          </div>
        </div>
      ) : null}

      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {EVENT_PALETTE.map((swatch) => {
            const active = values.color === swatch.value
            return (
              <button
                key={swatch.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ color: swatch.value })}
                aria-label={swatch.label}
                aria-pressed={active}
                className={cn(
                  "grid size-7 place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: swatch.value }}
              >
                {active ? (
                  <Check className="size-3.5" style={{ color: readableText(swatch.value) }} />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {!compact ? (
        <div>
          <Label htmlFor="event-desc">Description</Label>
          <textarea
            id="event-desc"
            className={cn(inputClass, "min-h-20 resize-y")}
            placeholder="Add notes, agenda, or context"
            value={values.description}
            disabled={disabled}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  )
}

