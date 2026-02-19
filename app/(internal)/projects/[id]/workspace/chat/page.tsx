"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { MessageSquare, Paperclip, Send, X } from "lucide-react"

interface AttachedFile {
  name: string
  size: string
  type: "pdf" | "image" | "file"
  url?: string
}

interface ChatMsg {
  id: number
  from: "client" | "agent"
  text: string
  time: string
  files?: AttachedFile[]
}

const INITIAL_CHAT: ChatMsg[] = [
  {
    id: 1,
    from: "client",
    text: "Can we reduce the extension depth slightly?",
    time: "10:24 AM",
  },
  {
    id: 2,
    from: "agent",
    text: "Yes, that improves approval chances. I'll revise the drawings and resend.",
    time: "10:41 AM",
  },
  {
    id: 3,
    from: "client",
    text: "Great, also any concerns about the left boundary?",
    time: "11:05 AM",
  },
  {
    id: 4,
    from: "agent",
    text: "We'll keep 1m clearance. That satisfies the council's party wall rules.",
    time: "11:18 AM",
  },
]

export default function WorkspaceChatPage() {
  const { id } = useParams<{ id: string }>()
  const [messages, setMessages] = useState(INITIAL_CHAT)
  const [inputText, setInputText] = useState("")
  const [pendingFiles, setPendingFiles] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const mapped: AttachedFile[] = files.map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
      type: f.type.startsWith("image/") ? "image" : "pdf",
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }))
    setPendingFiles((p) => [...p, ...mapped])
    e.target.value = ""
  }

  const handleSend = () => {
    if (!inputText.trim() && pendingFiles.length === 0) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`
    setMessages((p) => [
      ...p,
      {
        id: Date.now(),
        from: "agent",
        text: inputText.trim(),
        time,
        files: pendingFiles.length ? [...pendingFiles] : undefined,
      },
    ])
    setInputText("")
    setPendingFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-900">
                  Client Communication
                </p>
              </div>
              <span className="rounded-full bg-white border px-2.5 py-1 text-[11px] text-slate-600">
                Project {id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Channel: Customer to Agent X only.
            </p>
          </div>

          <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "agent" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    m.from === "agent"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                  {m.files?.map((f, i) => (
                    <div
                      key={i}
                      className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                        m.from === "agent" ? "bg-blue-700" : "bg-white border"
                      }`}
                    >
                      <Paperclip size={12} />
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-[10px] opacity-70">{f.size}</span>
                    </div>
                  ))}
                  <p
                    className={`text-[10px] mt-2 ${
                      m.from === "agent" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {m.from === "agent" ? "You" : "Client"} - {m.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {pendingFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {pendingFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs"
                >
                  <Paperclip size={12} className="text-blue-600" />
                  <span className="text-slate-700">{f.name}</span>
                  <button
                    onClick={() => setPendingFiles((p) => p.filter((_, j) => j !== i))}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white border rounded-xl p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message to the client..."
                rows={1}
                className="flex-1 resize-none text-sm outline-none bg-transparent leading-5 py-0.5 min-h-[30px] max-h-[100px]"
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                  const target = e.currentTarget
                  target.style.height = "auto"
                  target.style.height = Math.min(target.scrollHeight, 100) + "px"
                }}
              />
              <div className="flex items-center gap-1 pb-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
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
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Enter to send - Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}
