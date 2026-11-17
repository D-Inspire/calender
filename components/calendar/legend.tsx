interface LegendProps {
  isEmpty: boolean
}

export function Legend({ isEmpty }: LegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {new Date().getDate()}
        </span>
        Today
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-4 rounded-md ring-2 ring-ring ring-offset-1 ring-offset-background" />
        Selected
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-5 rounded-full bg-[#2B8CF4]" />
        Multi-day span
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-5 rounded-sm bg-[#06D6A0]/25 border-l-[3px] border-[#06D6A0]" />
        Single event
      </span>
      {isEmpty ? (
        <span className="italic">No events yet — click any day to add one.</span>
      ) : null}
    </div>
  )
}
