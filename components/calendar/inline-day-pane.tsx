"use client"

import { useEffect, useState } from "react"
import { Loader2, X, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventFields } from "./event-fields"
import { shortDayLabel } from "@/lib/calendar/date-utils"
import type { CalendarEvent } from "@/lib/calendar/types"
import {
  type EventFormValues,
  emptyFormValues,
  formValuesToEvent,
  validate,
  isValid,
} from "@/lib/calendar/form"

interface InlineDayPaneProps {
  open: boolean
  date: string
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onExpandToModal: (values: EventFormValues) => void
}

/**
 * Compact quick-create pane. Non-modal (no backdrop) so the month grid stays
 * visible for context while creating an event.
 */
export function InlineDayPane({ open, date, onClose, onSave, onExpandToModal }: InlineDayPaneProps) {
  const [values, setValues] = useState<EventFormValues>(emptyFormValues(date))
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(emptyFormValues(date))
    setTouched(false)
    setSaving(false)
  }, [open, date])

  if (!open) return null

  const errors = validate(values)
  const canSave = isValid(values)

  const handleSave = () => {
    setTouched(true)
    if (!canSave) return
    setSaving(true)
    // brief saving state so the spinner is observable in the prototype
    setTimeout(() => {
      onSave(formValuesToEvent(values))
    }, 500)
  }

  return (
    <div
      role="dialog"
      aria-label={`Quick add event on ${shortDayLabel(date)}`}
      className="fixed inset-x-3 bottom-3 z-30 max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xl animate-in fade-in slide-in-from-bottom-3 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-3 sm:w-80"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Quick add</p>
          <p className="text-xs text-muted-foreground">{shortDayLabel(date)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cancel quick add"
        >
          <X className="size-4" />
        </button>
      </div>

      <EventFields
        values={values}
        errors={touched || values.title !== "" ? errors : {}}
        onChange={(patch) => {
          setTouched(true)
          setValues((v) => ({ ...v, ...patch }))
        }}
        compact
        disabled={saving}
      />

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onExpandToModal(values)}
          disabled={saving}
        >
          <Maximize2 />
          Full editor
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !isValid(values)}>
            {saving ? <Loader2 className="animate-spin" /> : null}
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
