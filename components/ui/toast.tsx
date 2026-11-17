"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: number
  title: string
  description?: string
}

interface ToastContextValue {
  toast: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((title: string, description?: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, title, description }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3800)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[state=open]:fade-in",
      )}
      data-state="open"
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium leading-none">{toast.title}</p>
        {toast.description ? (
          <p className="text-xs text-muted-foreground">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
