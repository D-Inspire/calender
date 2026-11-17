"use client"

import { useCallback, useEffect, useState } from "react"
import type { CalendarEvent } from "@/lib/calendar/types"
import { SAMPLE_EVENTS } from "@/lib/calendar/sample-data"
import { todayISO } from "@/lib/calendar/date-utils"

const STORAGE_KEY = "calendar.events.v1"

function readStorage(): CalendarEvent[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const today = todayISO()
    const validEvents = (parsed as CalendarEvent[]).filter((e) => e.end_date >= today)
    return validEvents.length > 0 ? validEvents : null
  } catch {
    return null
  }
}

function writeStorage(events: CalendarEvent[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    // ignore quota / privacy-mode errors for the prototype
  }
}

export function newEventId(): string {
  return `E${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

/**
 * Client-side, localStorage-backed event collection. Seeds the sample data on
 * first load so the prototype opens with content that survives refreshes.
 */
export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    // Simulate a brief load so the skeleton state is observable.
    const timer = setTimeout(() => {
      const stored = readStorage()
      if (stored) {
        setEvents(stored)
      } else {
        setEvents(SAMPLE_EVENTS)
        writeStorage(SAMPLE_EVENTS)
      }
      setStatus("ready")
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  const persist = useCallback((next: CalendarEvent[]) => {
    setEvents(next)
    writeStorage(next)
  }, [])

  const upsertEvent = useCallback(
    (event: CalendarEvent) => {
      setEvents((prev) => {
        const exists = prev.some((e) => e.id === event.id)
        const next = exists
          ? prev.map((e) => (e.id === event.id ? event : e))
          : [...prev, event]
        writeStorage(next)
        return next
      })
    },
    [],
  )

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id)
      writeStorage(next)
      return next
    })
  }, [])

  const resetToSample = useCallback(() => {
    persist(SAMPLE_EVENTS)
  }, [persist])

  return { events, status, upsertEvent, deleteEvent, resetToSample }
}
