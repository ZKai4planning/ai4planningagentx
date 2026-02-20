"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react"

type EventType = {
  date: string // YYYY-MM-DD
  title: string
  color: string
  detail?: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()

  // Project flow timeline events
  const events: EventType[] = [
    {
      date: "2026-02-10",
      title: "Client Assigned to Agent X",
      detail: "Flow Step 1",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      date: "2026-02-11",
      title: "Project Assigned to Agent Y",
      detail: "Flow Step 2",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      date: "2026-02-12",
      title: "Received Checklist (Current)",
      detail: "Flow Step 3",
      color: "bg-blue-600 text-white",
    },
    {
      date: "2026-02-14",
      title: "Quote Raised",
      detail: "Flow Step 4",
      color: "bg-amber-100 text-amber-800",
    },
    {
      date: "2026-02-16",
      title: "70% Payment Received",
      detail: "Flow Step 5",
      color: "bg-amber-100 text-amber-800",
    },
    {
      date: "2026-02-20",
      title: "Document Collection and Review",
      detail: "Flow Step 6",
      color: "bg-sky-100 text-sky-800",
    },
    {
      date: "2026-02-25",
      title: "Council Submission",
      detail: "Flow Step 7",
      color: "bg-violet-100 text-violet-800",
    },
  ]

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const generateCalendarCells = () => {
    const cells = []

    for (let i = 0; i < startOffset; i++) {
      cells.push(
        <div key={`empty-${i}`} className="border border-slate-200 bg-white" />
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`

      const dayEvents = events.filter((e) => e.date === isoDate)

      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day

      cells.push(
        <div
          key={day}
          className={`border border-slate-200 p-2 min-h-[130px] transition hover:bg-slate-50 ${
            isToday ? "bg-blue-50" : "bg-white"
          }`}
        >
          <div
            className={`text-xs mb-2 ${
              isToday ? "text-blue-700 font-semibold" : "text-slate-500"
            }`}
          >
            {day}
          </div>

          <div className="space-y-1">
            {dayEvents.map((event, idx) => (
              <div
                key={idx}
                className={`text-xs px-2 py-1 rounded-md truncate ${event.color}`}
                title={event.detail ? `${event.title} - ${event.detail}` : event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return cells
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{monthLabel}</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={nextMonth}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg text-sm font-medium">
            Create Task
          </button>
          <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Customer Journey Flow in Calendar
        </p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1">
            Completed
          </span>
          <span className="rounded-full bg-blue-600 text-white px-2.5 py-1">
            Current: Received Checklist
          </span>
          <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-1">
            Next: Quote & Payment
          </span>
          <span className="rounded-full bg-sky-100 text-sky-800 px-2.5 py-1">
            Review
          </span>
          <span className="rounded-full bg-violet-100 text-violet-800 px-2.5 py-1">
            Final
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 text-sm text-slate-500 mb-2">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-slate-200 rounded-xl overflow-hidden bg-white">
        {generateCalendarCells()}
      </div>
    </div>
  )
}
