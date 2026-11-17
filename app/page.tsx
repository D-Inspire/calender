import { ToastProvider } from "@/components/ui/toast"
import { MonthView } from "@/components/calendar/month-view"

export default function Page() {
  return (
    <ToastProvider>
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <MonthView />
        </div>
      </main>
    </ToastProvider>
  )
}
