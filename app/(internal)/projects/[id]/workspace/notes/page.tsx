"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Lock, StickyNote } from "lucide-react"

const INITIAL_NOTES = [
  "Client confirmed boundary survey booked for 24 Feb.",
]

export default function WorkspaceNotesPage() {
  const { id } = useParams<{ id: string }>()
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes] = useState(INITIAL_NOTES)

  const addNote = () => {
    if (!noteText.trim()) return
    setNotes((prev) => [...prev, noteText.trim()])
    setNoteText("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-900">Internal Notes</p>
              </div>
              <span className="rounded-full bg-white border px-2.5 py-1 text-[11px] text-slate-600">
                Project {id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Private operational notes for Agent X workspace.
            </p>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto mb-4">
            {notes.map((n, i) => (
              <div
                key={i}
                className="rounded-lg bg-amber-50 border border-amber-100 px-3.5 py-2.5 text-sm text-amber-900 leading-relaxed"
              >
                {n}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              placeholder="Add internal note..."
              className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              onClick={addNote}
              className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Lock size={10} />
            Never shared externally
          </p>
        </div>
      </div>
    </div>
  )
}
