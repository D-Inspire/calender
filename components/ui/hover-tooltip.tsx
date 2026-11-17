"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HoverTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  /** delay in ms before showing (default 200ms) */
  delay?: number
}

/**
 * Desktop hover tooltip & mobile tap popover.
 * Full container element is an interactive target. On mobile, tapping opens event details,
 * and tapping outside closes them.
 */
export function HoverTooltip({ content, children, className, delay = 200 }: HoverTooltipProps) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(true), delay)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(false)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") {
      e.stopPropagation()
      setOpen((prev) => !prev)
    }
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full pointer-events-auto", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
    >
      {children}
      {open ? (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-[60] mb-2 w-max max-w-72 -translate-x-1/2 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl ring-1 ring-border/50">
            {content}
          </div>
        </div>
      ) : null}
    </div>
  )
}

