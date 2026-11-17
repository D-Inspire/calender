"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RotateCcw, AlertCircle } from "lucide-react"
import { useEvents } from "@/hooks/use-events"
import { useToast } from "@/components/ui/toast"
import type { CalendarEvent, RenderMode } from "@/lib/calendar/types"
import {
  buildMonthGrid,
  currentMonthKey,
  addMonthsToKey,
  monthKey as toMonthKey,
  todayISO,
  rangeLabel,
} from "@/lib/calendar/date-utils"
import { MAX_LANES_DESKTOP, MAX_LANES_MOBILE } from "@/lib/calendar/layout"
import type { EventFormValues } from "@/lib/calendar/form"
import { CalendarHeader } from "./calendar-header"
import { Legend } from "./legend"
import { MonthGrid } from "./month-grid"
import { GridSkeleton } from "./grid-skeleton"
import { DayDrawer } from "./day-drawer"
import { EventModal } from "./event-modal"
import { InlineDayPane } from "./inline-day-pane"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MonthView() {
  const { events, status, upsertEvent, deleteEvent, resetToSample } = useEvents()
  const { toast } = useToast()

  const [month, setMonth] = useState(currentMonthKey)
  const [dir, setDir] = useState<"left" | "right">("right")
  const [renderMode, setRenderMode] = useState<RenderMode>("span")
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inlineOpen, setInlineOpen] = useState(false)
  const [inlineDate, setInlineDate] = useState(todayISO())
  const [modalState, setModalState] = useState<{
    open: boolean
    editEvent: CalendarEvent | null
    date: string
    seed: EventFormValues | null
  }>({ open: false, editEvent: null, date: todayISO(), seed: null })
  const [pulseDates, setPulseDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const grid = useMemo(() => buildMonthGrid(month), [month])
  const maxLanes = isMobile ? MAX_LANES_MOBILE : MAX_LANES_DESKTOP

  const goPrev = () => {
    setDir("left")
    setMonth((m) => addMonthsToKey(m, -1))
  }
  const goNext = () => {
    setDir("right")
    setMonth((m) => addMonthsToKey(m, 1))
  }
  const goToday = () => {
    setDir("right")
    setMonth(currentMonthKey())
    setSelectedIso(todayISO())
  }

  const pulse = useCallback((event: CalendarEvent) => {
    const dates = new Set<string>()
    let cur = event.start_date
    // walk inclusive range
    while (cur <= event.end_date) {
      dates.add(cur)
      const d = new Date(cur + "T12:00:00")
      d.setDate(d.getDate() + 1)
      cur = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`
    }
    setPulseDates(dates)
    setTimeout(() => setPulseDates(new Set()), 1300)
  }, [])

  const handleSave = useCallback(
    (event: CalendarEvent) => {
      upsertEvent(event)
      // jump to the month where the event begins so it's visible
      setMonth(toMonthKey(event.start_date))
      pulse(event)
      setModalState((s) => ({ ...s, open: false, seed: null }))
      setInlineOpen(false)
      toast("Event saved.", `${rangeLabel(event.start_date, event.end_date)} highlighted.`)
    },
    [upsertEvent, pulse, toast],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteEvent(id)
      setModalState((s) => ({ ...s, open: false }))
      toast("Event deleted.")
    },
    [deleteEvent, toast],
  )

  // --- interaction entry points ---
  const openDrawer = (iso: string) => {
    setSelectedIso(iso)
    setDrawerOpen(true)
  }
  const openInlineCreate = () => {
    const targetDate = selectedIso && selectedIso >= todayISO() ? selectedIso : todayISO()
    setInlineDate(targetDate)
    setInlineOpen(true)
  }
  const openModalCreate = (date: string) => {
    if (date < todayISO()) {
      toast("Past date selected", "Event creation on past dates is disabled.")
      return
    }
    setDrawerOpen(false)
    setModalState({ open: true, editEvent: null, date, seed: null })
  }
  const openModalEdit = (event: CalendarEvent) => {
    setModalState({ open: true, editEvent: event, date: event.start_date, seed: null })
  }
  const expandInlineToModal = (values: EventFormValues) => {
    setInlineOpen(false)
    setModalState({ open: true, editEvent: null, date: values.start_date, seed: values })
  }

  const isEmpty = status === "ready" && events.length === 0

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <CalendarHeader
        monthKey={month}
        renderMode={renderMode}
        disabled={status === "loading"}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onAdd={openInlineCreate}
        onRenderModeChange={setRenderMode}
      />

      {status === "error" ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="size-4" />
            Unable to load events.
          </span>
          <Button variant="outline" size="sm" onClick={resetToSample}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* relative wrapper so the inline pane can anchor within the calendar */}
      <div className="relative">
        {status === "loading" ? (
          <GridSkeleton />
        ) : (
          <div
            key={month}
            className={cn(
              "animate-in fade-in duration-200",
              dir === "right" ? "slide-in-from-right-4" : "slide-in-from-left-4",
            )}
          >
            <MonthGrid
              grid={grid}
              events={events}
              renderMode={renderMode}
              maxLanes={maxLanes}
              selectedIso={selectedIso}
              pulseDates={pulseDates}
              onSelectDay={openDrawer}
              onEventClick={openModalEdit}
            />
          </div>
        )}

        <InlineDayPane
          open={inlineOpen}
          date={inlineDate}
          onClose={() => setInlineOpen(false)}
          onSave={handleSave}
          onExpandToModal={expandInlineToModal}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Legend isEmpty={isEmpty} />
        <Button
          variant="ghost"
          size="xs"
          onClick={resetToSample}
          className="self-start text-muted-foreground"
        >
          <RotateCcw />
          Reset sample data
        </Button>
      </div>

      <DayDrawer
        open={drawerOpen}
        date={selectedIso}
        events={events}
        onClose={() => setDrawerOpen(false)}
        onAdd={openModalCreate}
        onEdit={openModalEdit}
      />

      <EventModal
        open={modalState.open}
        editEvent={modalState.editEvent}
        defaultDate={modalState.date}
        initialValues={modalState.seed}
        onClose={() => setModalState((s) => ({ ...s, open: false, seed: null }))}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
