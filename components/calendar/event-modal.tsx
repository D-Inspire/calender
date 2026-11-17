"use client"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { EventFields } from "./event-fields"
import type { CalendarEvent } from "@/lib/calendar/types"
import {
  type EventFormValues,
  emptyFormValues,
  eventToFormValues,
  formValuesToEvent,
  validate,
  isValid,
} from "@/lib/calendar/form"

interface EventModalProps {
  open: boolean
  /** provided when editing an existing event */
  editEvent?: CalendarEvent | null
  /** default date for a new event */
  defaultDate: string
  /** pre-filled values, e.g. when promoting a quick-create to the full editor */
  initialValues?: EventFormValues | null
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete?: (id: string) => void
}

export function EventModal({
  open,
  editEvent,
  defaultDate,
  initialValues,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) {
  const [values, setValues] = useState<EventFormValues>(emptyFormValues(defaultDate))
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(
      editEvent
        ? eventToFormValues(editEvent)
        : initialValues ?? emptyFormValues(defaultDate),
    )
    setTouched(false)
  }, [open, editEvent, defaultDate, initialValues])

  const errors = validate(values)
  const canSave = isValid(values)

  const handleSave = () => {
    setTouched(true)
    if (!canSave) return
    onSave(formValuesToEvent(values, editEvent?.id))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editEvent ? "Edit event" : "New event"}
      description={
        editEvent ? "Update the details for this event." : "Fill in the details to schedule a new event."
      }
      footer={
        <div className="flex w-full items-center justify-between">
          {editEvent && onDelete ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(editEvent.id)}
            >
              <Trash2 />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!canSave}>
              Save event
            </Button>
          </div>
        </div>
      }
    >
      <EventFields
        values={values}
        errors={touched || values.title !== "" ? errors : {}}
        onChange={(patch) => {
          setTouched(true)
          setValues((v) => ({ ...v, ...patch }))
        }}
      />
    </Modal>
  )
}
