"use client"
import Link from "next/link"

import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  Phone, Mail, MapPin, FileText, Loader2, Lock,
  CheckCircle, Clock, Send, Paperclip, Download,
  X, ChevronRight, Building2, Calendar, Ruler,
  AlertTriangle, MessageSquare, File, ImageIcon,
  BadgeCheck, CircleDot, Circle, TrendingUp,
  StickyNote, Eye, EyeOff,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */

const assignedAgentY = "Agent Y – Planning Team A"

const customer = {
  name: "Alex Johnson",
  phone: "+44 7400 123456",
  email: "alex.johnson@email.com",
  location: "London, UK",
  status: "Active",
}

const flow = {
  currentStep: 5,
  steps: [
    { label: "Profile Created",           desc: "Account set up" },
    { label: "Service Selected",          desc: "HSPC chosen" },
    { label: "£30 Advance Payment",       desc: "paid" },
    { label: "Eligibility Check",         desc: "Passed" },
    { label: "Consultant Assigned",       desc: "In progress" },
    { label: "Quote Submitted",           desc: "Awaiting sign-off" },
    { label: "70% Payment Completed",     desc: "£6,930 pending" },
    { label: "Project Allocated to Agent Y", desc: "Handoff done" },
    { label: "Council Submission",        desc: "Final stage" },
  ],
}

const project = {
  id: "PROJ-UK-7842",
  service: "Householder Planning Consent",
  serviceNo: "HSPC-UK-007",
  stage: "Pre-Planning",
  timeline: "01 Jan → 30 Jun 2026",
}

const requirements = {
  propertyType: "Semi-Detached House",
  locationType: "Residential",
  timeline: "4–6 Months",
  scope: [
    "Single-storey rear extension",
    "Internal layout modification",
  ],
  constraints: [
    "Council height regulations",
    "Neighbour boundary on left",
  ],
  notes: "Client prefers modern elevation and minimal disruption during construction.",
}

const quote = {
  reference: "QT-UK-2219",
  submittedOn: "18 Feb 2026",
  status: "approved",
  total: "£9,900",
  breakdown: [
    { label: "Consultancy",   amount: "£4,200", pct: 42 },
    { label: "Drawings",      amount: "£3,100", pct: 31 },
    { label: "Council Fees",  amount: "£2,600", pct: 27 },
  ],
}

const payments = [
  { label: "30% Advance",     amount: "£2,970", status: "paid" },
  { label: "Quote Approval",  amount: "—",      status: "completed" },
  { label: "70% Final",       amount: "£6,930", status: "pending" },
]

const documents = [
  { id: 1, name: "Site Layout.pdf",       size: "1.2 MB",  type: "pdf"   },
  { id: 2, name: "Proposed Drawings.pdf", size: "860 KB",  type: "pdf"   },
  { id: 3, name: "Elevation Sketch.png",  size: "540 KB",  type: "image" },
]

const INITIAL_CHAT: ChatMsg[] = [
  { id: 1, from: "client", text: "Can we reduce the extension depth slightly?",            time: "10:24 AM" },
  { id: 2, from: "agent",  text: "Yes, that improves approval chances. I'll revise the drawings and resend.",  time: "10:41 AM" },
  { id: 3, from: "client", text: "Great, also any concerns about the left boundary?",     time: "11:05 AM" },
  { id: 4, from: "agent",  text: "We'll keep 1m clearance. That satisfies the council's party wall rules.", time: "11:18 AM" },
]

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface ChatMsg {
  id: number
  from: "client" | "agent"
  text: string
  time: string
  files?: AttachedFile[]
}

interface AttachedFile {
  name: string
  size: string
  type: "pdf" | "image" | "file"
  url?: string
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function UserDetailsPage() {
  const { id } = useParams()
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes]       = useState<string[]>([
    "Client confirmed boundary survey booked for 24 Feb.",
  ])
  const [showPayments, setShowPayments] = useState(true)

  // chat
  const [messages, setMessages]     = useState<ChatMsg[]>(INITIAL_CHAT)
  const [inputText, setInputText]   = useState("")
  const [pendingFiles, setPendingFiles] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAssign = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setOpen(true) }, 1000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const mapped: AttachedFile[] = files.map(f => ({
      name: f.name,
      size: formatBytes(f.size),
      type: f.type.startsWith("image/") ? "image" : "pdf",
      url:  f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }))
    setPendingFiles(p => [...p, ...mapped])
    e.target.value = ""
  }

  const handleSend = () => {
    if (!inputText.trim() && pendingFiles.length === 0) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`
    setMessages(p => [...p, {
      id: Date.now(), from: "agent",
      text: inputText.trim(), time,
      files: pendingFiles.length ? [...pendingFiles] : undefined,
    }])
    setInputText("")
    setPendingFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const addNote = () => {
    if (!noteText.trim()) return
    setNotes(p => [...p, noteText.trim()])
    setNoteText("")
  }

  const progress = Math.round((flow.currentStep / (flow.steps.length - 1)) * 100)

  return (
    <div
      className="min-h-screen bg-slate-100"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
    >
      {/* ── TOP NAV BAR ── */}
      {/* <div className="sticky top-0 z-30 bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-xs font-bold">Y</div>
            <span className="text-sm font-semibold text-slate-200">{assignedAgentY}</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
            {project.id}
          </span>
          <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full font-medium">
            {project.stage}
          </span>
        </div>

        
      </div> */}

      <div className="px-5 py-5 space-y-5 max-w-[1600px] mx-auto">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{customer.name}</h1>
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {customer.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customer ID · <span className="font-mono">{id ?? "CUST-4421"}</span>
              <span className="mx-2">·</span>
              {project.service}
              <span className="mx-2">·</span>
              {project.timeline}
            </p>
          </div>

          {/* Progress pill */}
          <div className="flex items-center gap-3 bg-white rounded-xl border px-4 py-5 shadow-sm">
            <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#2563eb" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
             <div>
              <p className="text-xl font-bold text-slate-900 leading-none">{progress}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Journey Progress</p>
            </div>
            <div></div>
           {/* <button
          onClick={handleAssign}
          className="flex items-center h-12 gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm px-4 py-1.5 rounded-lg font-medium"
        >
          <BadgeCheck size={15} />
          Assign to Agent Y
        </button> */}
          </div>
        </div>

        {/* ── JOURNEY TRACKER ── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-1">
            <div>
              <p className="text-sm font-bold text-slate-800">Customer Journey</p>
              <p className="text-xs text-slate-500">End-to-end service lifecycle</p>
            </div>
            <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full">
              Step {flow.currentStep + 1} of {flow.steps.length}
            </span>
          </div>

          {/* Scrollable stepper */}
          <div className="overflow-x-auto px-6 py-6">
            <div className="relative flex items-start" style={{ minWidth: `${flow.steps.length * 130}px` }}>
              {/* Background rail */}
              <div className="absolute top-[18px] left-[18px] right-[18px] h-[2px] bg-slate-200 rounded-full" />
              {/* Progress fill */}
              <div
                className="absolute top-[18px] left-[18px] h-[2px] bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `calc(${(flow.currentStep / (flow.steps.length - 1)) * 100}% * (100% - 36px) / 100)` }}
              />

              {flow.steps.map((step, i) => {
                const status = i < flow.currentStep ? "completed" : i === flow.currentStep ? "active" : "upcoming"
                return (
                  <div key={step.label} className="relative flex flex-col items-center flex-1">
                    {/* Node */}
                    <div className={`
                      w-9 h-9 rounded-full flex items-center justify-center z-10
                      transition-all duration-300 flex-shrink-0
                      ${status === "completed" ? "bg-blue-600 shadow-md shadow-blue-200"
                        : status === "active"    ? "bg-white border-2 border-blue-600 shadow-md shadow-blue-100"
                        : "bg-white border-2 border-slate-200"}
                    `}>
                      {status === "completed" ? (
                        <CheckCircle className="w-[18px] h-[18px] text-white" />
                      ) : status === "active" ? (
                        <Clock className="w-[17px] h-[17px] text-blue-600" />
                      ) : (
                        <Circle className="w-3 h-3 text-slate-300" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-center px-1">
                      <p className={`text-[11px] font-semibold leading-tight
                        ${status === "active" ? "text-blue-700"
                          : status === "completed" ? "text-slate-700"
                          : "text-slate-400"}`}>
                        {step.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 leading-tight
                        ${status === "active" ? "text-blue-400"
                          : status === "completed" ? "text-slate-400"
                          : "text-slate-300"}`}>
                        {step.desc}
                      </p>
                      {status === "active" && (
                        <span className="inline-block mt-1 text-[9px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                          Now
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active step callout */}
          <div className="mx-6 mb-5 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-900">{flow.steps[flow.currentStep].label}</p>
              <p className="text-[11px] text-blue-500">{flow.steps[flow.currentStep].desc}</p>
            </div>
            {flow.steps[flow.currentStep + 1] && (
              <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold flex-shrink-0">
                <span>Next: {flow.steps[flow.currentStep + 1].label}</span>
                <ChevronRight size={13} />
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid xl:grid-cols-3 gap-5">

          {/* ── LEFT COL ── */}
          <div className="xl:col-span-2 space-y-5">

            {/* CLIENT REQUIREMENTS */}
            <Section title="Client Requirements" icon={<Building2 size={15} />}>

  {/* ================= SERVICE CONTEXT ================= */}
  <div className="mb-4 rounded-xl border bg-white px-4 py-3">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
      Selected Service
    </p>

    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {project.service}
        </p>
        <p className="text-xs text-slate-500">
          Service ID · <span className="font-mono">{project.serviceNo}</span>
        </p>
      </div>

      <span className="rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-xs font-semibold">
        Active Service
      </span>
    </div>
  </div>

  {/* ================= META INFO ================= */}
  <div className="grid sm:grid-cols-3 gap-4 mb-4">
    <MetaBox
      icon={<Building2 size={13} className="text-blue-500" />}
      label="Property Type"
      value={requirements.propertyType}
    />
    <MetaBox
      icon={<MapPin size={13} className="text-emerald-500" />}
      label="Location Type"
      value={requirements.locationType}
    />
    <MetaBox
      icon={<Calendar size={13} className="text-violet-500" />}
      label="Timeline"
      value={requirements.timeline}
    />
  </div>

  {/* ================= SCOPE & CONSTRAINTS ================= */}
  <div className="grid sm:grid-cols-2 gap-4">
    {/* Scope */}
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
        <Ruler size={11} /> Scope of Work
      </p>
      <ul className="space-y-1.5">
        {requirements.scope.map(s => (
          <li
            key={s}
            className="flex items-start gap-2 text-xs text-slate-700"
          >
            <CircleDot
              size={11}
              className="text-blue-500 mt-0.5 flex-shrink-0"
            />
            {s}
          </li>
        ))}
      </ul>
    </div>

    {/* Constraints */}
    <div className="rounded-xl border bg-amber-50 border-amber-100 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1">
        <AlertTriangle size={11} /> Constraints
      </p>
      <ul className="space-y-1.5">
        {requirements.constraints.map(c => (
          <li
            key={c}
            className="flex items-start gap-2 text-xs text-amber-800"
          >
            <AlertTriangle
              size={11}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            {c}
          </li>
        ))}
      </ul>
    </div>
  </div>

  {/* ================= NOTES ================= */}
  <div className="mt-3 rounded-xl border bg-slate-50 px-3.5 py-2.5">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
      Client Notes
    </p>
    <p className="text-xs text-slate-600 leading-relaxed">
      {requirements.notes}
    </p>
  </div>
</Section>


            {/* QUOTE SUMMARY */}
            <Section title="Quote Summary" icon={<TrendingUp size={15} />}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-slate-700">{quote.reference}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                    {quote.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">Submitted {quote.submittedOn}</span>
              </div>

              <div className="space-y-2 mb-4">
                {quote.breakdown.map(b => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-28">{b.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-700"
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 w-16 text-right">{b.amount}</span>
                    <span className="text-[10px] text-slate-400 w-8 text-right">{b.pct}%</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center rounded-xl bg-slate-900 text-white px-4 py-3">
                <span className="text-sm font-semibold">Total Project Value</span>
                <span className="text-xl font-bold tracking-tight">{quote.total}</span>
              </div>
            </Section>

            {/* DOCUMENTS */}
           {/* <Section title="Project Documents" icon={<FileText size={15} />}>
  <div className="space-y-2">
    {documents.map((doc) => (
      <div
        key={doc.id}
        className="
          flex flex-col sm:flex-row sm:items-center sm:justify-between
          gap-3 rounded-xl border bg-slate-50 px-3.5 py-3
          hover:bg-white hover:shadow-sm transition-all
        "
      >
       
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              doc.type === "image"
                ? "bg-violet-100"
                : "bg-blue-100"
            }`}
          >
            {doc.type === "image" ? (
              <ImageIcon size={14} className="text-violet-600" />
            ) : (
              <FileText size={14} className="text-blue-600" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {doc.name}
            </p>
            <p className="text-[10px] text-slate-400">
              {doc.size}
            </p>
          </div>
        </div>

        
        <div className="flex items-center gap-3 sm:gap-2 sm:justify-end">
          <button
            className="
              flex items-center justify-center gap-1
              text-[11px] text-blue-600 hover:text-blue-800
              font-medium transition-colors
              px-2 py-1 rounded-lg hover:bg-blue-50
            "
          >
            <Eye size={13} />
            <span className="hidden sm:inline">View</span>
          </button>

          <button
            className="
              flex items-center justify-center gap-1
              text-[11px] text-blue-600 hover:text-blue-800
              font-medium transition-colors
              px-2 py-1 rounded-lg hover:bg-blue-50
            "
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
    ))}
  </div>
</Section> */}


            {/* CLIENT COMMUNICATION
            <Section title="Client Communication" icon={<MessageSquare size={15} />}>
             
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 mb-4">
                {messages.map(m => (
                  <div key={m.id} className={`flex flex-col ${m.from === "agent" ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                      m.from === "agent"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-white border text-slate-800 rounded-tl-sm"
                    }`}>
                      {m.text && <p className="leading-relaxed text-[13px]">{m.text}</p>}
                      {m.files?.map((f, i) => (
                        <div key={i} className="mt-2 flex items-center gap-2 bg-white/20 rounded-lg px-2.5 py-1.5 text-xs">
                          <File size={11} />
                          <span className="truncate max-w-[140px]">{f.name}</span>
                          <span className="opacity-70">{f.size}</span>
                        </div>
                      ))}
                    </div>
                    <span className={`text-[10px] mt-1 ${m.from === "agent" ? "text-slate-400" : "text-slate-400"}`}>
                      {m.from === "agent" ? "You" : "Client"} · {m.time}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 text-xs">
                      <File size={11} className="text-blue-500" />
                      <span className="text-slate-700 max-w-[110px] truncate">{f.name}</span>
                      <button onClick={() => setPendingFiles(p => p.filter((_,j) => j !== i))}
                        className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              
              <div className="flex items-end gap-2 rounded-xl border-2 border-slate-200 focus-within:border-blue-400 transition-colors px-3 py-2 bg-white">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message to the client…"
                  rows={1}
                  className="flex-1 resize-none text-sm outline-none bg-transparent leading-5 py-0.5 min-h-[30px] max-h-[100px]"
                  onInput={(e: any) => {
                    e.target.style.height = "auto"
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"
                  }}
                />
                <div className="flex items-center gap-1 pb-0.5">
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() && pendingFiles.length === 0}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
            </Section> */}
          </div>

          {/* ── RIGHT COL ── */}
          <div className="space-y-5">

            {/* CUSTOMER PROFILE */}
            <Section title="Customer Profile" icon={<Phone size={15} />}>
              <div className="space-y-2.5">
                <ProfileRow icon={<Phone size={13} className="text-blue-500" />} label="Phone" value={customer.phone} />
                <ProfileRow icon={<Mail size={13} className="text-emerald-500" />} label="Email" value={customer.email} />
                <ProfileRow icon={<MapPin size={13} className="text-rose-500" />} label="Location" value={customer.location} />
              </div>
            </Section>

            {/* PAYMENT TIMELINE */}
            <Section
              title="Payment Timeline"
              icon={<Lock size={15} />}
              badge={
                <button
                  onClick={() => setShowPayments(p => !p)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                  title={showPayments ? "Hide" : "Show"}
                >
                  {showPayments ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              }
            >
              {showPayments ? (
                <>
                  <div className="space-y-2 mb-3">
                    {payments.map((p, i) => (
                      <div key={p.label} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 ${
                          p.status === "paid"      ? "bg-emerald-500"
                          : p.status === "completed" ? "bg-blue-500"
                          : "bg-amber-400"
                        }`}>
                          {p.status === "paid" || p.status === "completed" ? "✓" : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-700">{p.label}</p>
                          <p className="text-[10px] text-slate-400">{p.amount}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          p.status === "paid"       ? "bg-emerald-50 text-emerald-700"
                          : p.status === "completed"  ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-2 border-t">
                    <Lock size={10} />
                    Visible to Agent X only
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">Payment details hidden</p>
              )}
            </Section>

            {/* INTERNAL NOTES */}
            <Section title="Internal Notes" icon={<StickyNote size={15} />}>
              <div className="space-y-2 max-h-[200px] overflow-y-auto mb-3">
                {notes.map((n, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-900 leading-relaxed">
                    {n}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addNote()}
                  placeholder="Add internal note…"
                  className="flex-1 text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
                <button
                  onClick={addNote}
                  className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Lock size={10} /> Never shared externally
              </p>
            </Section>

          </div>
        </div>
      </div>

      {/* ── ASSIGN DIALOG ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="text-emerald-600" size={18} />
              Project Assigned
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 border px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Project ID</p>
              <p className="font-mono font-bold text-slate-900">{project.id}</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
              <p className="text-sm font-semibold text-blue-900">{assignedAgentY}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Confirm & Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LOADING ── */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center">
          <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-700">Assigning project…</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function Section({
  title, icon, badge, children
}: {
  title: string
  icon: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{icon}</span>
          <p className="text-sm font-bold text-slate-800">{title}</p>
        </div>
        {badge}
      </div>
      {children}
    </div>
  )
}

function MetaBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 px-3.5 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className="text-xs font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}