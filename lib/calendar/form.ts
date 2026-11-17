import type { CalendarEvent } from "./types"
import { EVENT_PALETTE } from "./types"
import { newEventId } from "@/hooks/use-events"
import {
  todayISO,
  currentTimeHHMM,
  isPastDate,
  isPastDateTime,
  getValidDefaultTimes,
  timeLabel,
} from "./date-utils"

export interface EventFormValues {
  title: string
  start_date: string
  end_date: string
  all_day: boolean
  start_time: string
  end_time: string
  color: string
  description: string
}

export function emptyFormValues(dateIso: string): EventFormValues {
  const safeStartDate = isPastDate(dateIso) ? todayISO() : dateIso
  const { start_time, end_time } = getValidDefaultTimes(safeStartDate)

  return {
    title: "",
    start_date: safeStartDate,
    end_date: safeStartDate,
    all_day: false,
    start_time,
    end_time,
    color: EVENT_PALETTE[0].value,
    description: "",
  }
}

export function eventToFormValues(event: CalendarEvent): EventFormValues {
  const { start_time, end_time } = getValidDefaultTimes(event.start_date)
  return {
    title: event.title,
    start_date: event.start_date,
    end_date: event.end_date,
    all_day: event.all_day,
    start_time: event.start_time ?? start_time,
    end_time: event.end_time ?? end_time,
    color: event.color,
    description: event.description ?? "",
  }
}

export interface FormErrors {
  title?: string
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
}

export function validate(values: EventFormValues): FormErrors {
  const errors: FormErrors = {}
  const now = new Date()
  const today = todayISO()

  if (!values.title.trim()) {
    errors.title = "Title is required."
  }

  // 1. Start date validation (preserve existing)
  if (!values.start_date) {
    errors.start_date = "Start date is required."
  } else if (values.start_date < today) {
    errors.start_date = "Start date cannot be in the past."
  }

  // 2. End date validation (preserve existing)
  if (!values.end_date) {
    errors.end_date = "End date is required."
  } else if (values.end_date < values.start_date) {
    errors.end_date = "End date can't be before the start date."
  } else if (values.end_date < today) {
    errors.end_date = "End date cannot be in the past."
  }

  // 3. Time validation (BUG 1 — DYNAMIC TIME CHECK)
  if (!values.all_day) {
    if (!values.start_time) {
      errors.start_time = "Start time is required."
    } else if (values.start_date === today) {
      const [y, m, d] = values.start_date.split("-").map(Number)
      const [hh, mm] = values.start_time.split(":").map(Number)
      const selectedStartDateTime = new Date(y, m - 1, d, hh, mm, 0, 0)

      if (selectedStartDateTime <= now) {
        const nowTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        errors.start_time = `Start time must be later than current time (${timeLabel(nowTimeStr)}).`
      }
    }

    if (!values.end_time) {
      errors.end_time = "End time is required."
    } else if (values.start_date === values.end_date && values.start_time && values.end_time <= values.start_time) {
      errors.end_time = "End time must be after start time."
    } else if (values.end_date === today && values.end_time) {
      const [y, m, d] = values.end_date.split("-").map(Number)
      const [hh, mm] = values.end_time.split(":").map(Number)
      const selectedEndDateTime = new Date(y, m - 1, d, hh, mm, 0, 0)

      if (selectedEndDateTime <= now) {
        errors.end_time = "End time must be later than current time."
      }
    }
  }

  return errors
}

export function isValid(values: EventFormValues): boolean {
  return Object.keys(validate(values)).length === 0
}

/** Merge form values into an event, creating an id when none is provided. */
export function formValuesToEvent(values: EventFormValues, existingId?: string): CalendarEvent {
  const now = new Date()
  const today = todayISO()

  if (values.start_date === today && !values.all_day && values.start_time) {
    const [y, m, d] = values.start_date.split("-").map(Number)
    const [hh, mm] = values.start_time.split(":").map(Number)
    const selectedStartDateTime = new Date(y, m - 1, d, hh, mm, 0, 0)
    if (selectedStartDateTime <= now) {
      throw new Error("Cannot create event: Selected start time has already passed.")
    }
  }

  const errors = validate(values)
  if (Object.keys(errors).length > 0) {
    const errorMsg = Object.values(errors)[0]
    throw new Error(`Cannot save invalid event: ${errorMsg}`)
  }

  return {
    id: existingId ?? newEventId(),
    title: values.title.trim(),
    start_date: values.start_date,
    end_date: values.end_date < values.start_date ? values.start_date : values.end_date,
    all_day: values.all_day,
    start_time: values.all_day ? null : values.start_time || null,
    end_time: values.all_day ? null : values.end_time || null,
    color: values.color,
    description: values.description.trim(),
  }
}

