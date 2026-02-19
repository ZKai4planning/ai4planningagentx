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
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()

  // Sample events (use ISO format)
  const events: EventType[] = [
    {
      date: "2026-02-01",
      title: "Initial Client Call",
      color: "bg-blue-100 text-blue-800",
    },
    {
      date: "2026-02-02",
      title: "Setup",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      date: "2026-02-03",
      title: "Review Documents",
      color: "bg-sky-100 text-sky-800",
    },
    {
      date: "2026-02-08",
      title: "Data Migration",
      color: "bg-green-100 text-green-800",
    },
    {
      date: "2026-02-02",
      title: "Validation Loop",
      color: "bg-emerald-500 text-white",
    },
    {
      date: "2026-02-12",
      title: "Joint Workshop",
      color: "bg-blue-600 text-white",
    },
  ]

  // Format month label
  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  // Get days in month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Get first day (Monday based)
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

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      cells.push(
        <div key={`empty-${i}`} className="border border-slate-200 bg-white" />
      )
    }

    // Days
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
      {/* Header */}
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

      {/* Week Days */}
      <div className="grid grid-cols-7 text-sm text-slate-500 mb-2">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border border-slate-200 rounded-xl overflow-hidden bg-white">
        {generateCalendarCells()}
      </div>
    </div>
  )
}
