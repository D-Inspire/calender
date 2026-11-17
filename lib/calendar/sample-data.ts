import type { CalendarEvent } from "./types"
import { todayISO, addDaysISO } from "./date-utils"

const today = todayISO()

export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "E100",
    title: "Project Meeting",
    start_date: today,
    end_date: addDaysISO(today, 2),
    start_time: "10:00",
    end_time: "15:00",
    color: "#2B8CF4",
    description: "Project planning and milestones.",
    all_day: false,
  },
  {
    id: "E101",
    title: "Design Review",
    start_date: addDaysISO(today, 3),
    end_date: addDaysISO(today, 3),
    start_time: "14:00",
    end_time: "15:00",
    color: "#E75A7C",
    description: "Review new UI.",
    all_day: false,
  },
  {
    id: "E102",
    title: "Sprint Planning",
    start_date: addDaysISO(today, 5),
    end_date: addDaysISO(today, 7),
    start_time: "09:00",
    end_time: "17:00",
    color: "#FFD166",
    description: "Upcoming sprint goals and task breakdown.",
    all_day: false,
  },
  {
    id: "E103",
    title: "1:1 Sync",
    start_date: addDaysISO(today, 1),
    end_date: addDaysISO(today, 1),
    start_time: "15:00",
    end_time: "15:30",
    color: "#06D6A0",
    description: "Weekly 1:1 catchup.",
    all_day: false,
  },
  {
    id: "E104",
    title: "Quarterly Strategic Planning and Cross-Functional Roadmap Alignment Session",
    start_date: addDaysISO(today, 1),
    end_date: addDaysISO(today, 1),
    start_time: null,
    end_time: null,
    color: "#7C6AF0",
    description: "Record with missing times renders as all-day.",
    all_day: true,
  },
  {
    id: "E105",
    title: "Team Lunch",
    start_date: addDaysISO(today, 1),
    end_date: addDaysISO(today, 1),
    start_time: "12:00",
    end_time: "13:00",
    color: "#64748B",
    description: "Crowded day sample for the +N more pill.",
    all_day: false,
  },
]

