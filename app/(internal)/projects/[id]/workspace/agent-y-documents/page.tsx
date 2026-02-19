"use client"

import { useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Download, Eye, FileText, ToggleLeft, ToggleRight, Upload } from "lucide-react"
import { useDocumentMediation } from "../documents/store"

export default function AgentYDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? "unknown-project"
  const {
    state,
    hydrated,
    loadChecklistFromAgentY,
    toggleRequestForCustomer,
    toggleRequestToAgentY,
    markReceivedFromAgentY,
    uploadManualByAgentX,
    logsForAgentYDocs,
  } = useDocumentMediation(projectId)
  const [manualUploadTarget, setManualUploadTarget] = useState<string | null>(null)
  const manualInputRef = useRef<HTMLInputElement>(null)

  const viewDocument = (name: string, size: string, uploadedAt: string) => {
    const html = `
      <html><body style="font-family: Arial, sans-serif; padding: 24px;">
      <h3>${name}</h3><p>Size: ${size}</p><p>Uploaded At: ${uploadedAt}</p>
      <p style="color:#64748b;">Preview is metadata-only in this demo workspace.</p>
      </body></html>
    `
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank", "noopener,noreferrer")
    window.setTimeout(() => URL.revokeObjectURL(url), 3000)
  }

  const downloadDocumentMeta = (name: string, size: string, uploadedAt: string) => {
    const content = `Document: ${name}\nSize: ${size}\nUploaded At: ${uploadedAt}\nProject: ${projectId}\n`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name}-meta.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const triggerManualUpload = (docId: string) => {
    setManualUploadTarget(docId)
    manualInputRef.current?.click()
  }

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !manualUploadTarget) return
    uploadManualByAgentX(manualUploadTarget, file)
    setManualUploadTarget(null)
    e.target.value = ""
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-8 space-y-5">
        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-900">Agent Y Documents</p>
              </div>
              <span className="rounded-full bg-white border px-2.5 py-1 text-[11px] text-slate-600">
                Project {projectId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Agent X receives checklist from Agent Y and selects which docs are requested from customer.
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Checklist from Agent Y</h2>
            <button
              onClick={loadChecklistFromAgentY}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2"
            >
              Checklist from Agent Y
            </button>
          </div>

          {!hydrated || state.checklist.length === 0 ? (
            <div className="rounded-xl border bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No checklist loaded.</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "Checklist from Agent Y" to load required documents list.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.checklist.map((doc) => (
                <div key={doc.id} className="rounded-xl border bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            doc.required ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {doc.required ? "Required" : "Optional"}
                        </span>
                        {doc.customerUpload && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                            Uploaded by Customer
                          </span>
                        )}
                        {doc.agentYUpload && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-violet-100 text-violet-700">
                            Uploaded by Agent Y
                          </span>
                        )}
                        {doc.agentXUpload && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                            Uploaded by Agent X
                          </span>
                        )}
                        {doc.requestedToAgentY && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                            Requested to Agent Y
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{doc.description}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Allowed: {doc.allowedFileTypes.join(", ")}
                      </p>
                      {doc.customerUpload && (
                        <div className="mt-2 text-[11px]">
                          <p className="text-slate-700 font-semibold">
                            Customer: {doc.customerUpload.name} - {doc.customerUpload.size}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                viewDocument(
                                  doc.customerUpload!.name,
                                  doc.customerUpload!.size,
                                  doc.customerUpload!.uploadedAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Eye size={11} />
                              View
                            </button>
                            <button
                              onClick={() =>
                                downloadDocumentMeta(
                                  doc.customerUpload!.name,
                                  doc.customerUpload!.size,
                                  doc.customerUpload!.uploadedAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Download size={11} />
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                      {doc.agentYUpload && (
                        <div className="mt-2 text-[11px]">
                          <p className="text-slate-700 font-semibold">
                            Agent Y: {doc.agentYUpload.name} - {doc.agentYUpload.size}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                viewDocument(
                                  doc.agentYUpload!.name,
                                  doc.agentYUpload!.size,
                                  doc.agentYUpload!.uploadedAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Eye size={11} />
                              View
                            </button>
                            <button
                              onClick={() =>
                                downloadDocumentMeta(
                                  doc.agentYUpload!.name,
                                  doc.agentYUpload!.size,
                                  doc.agentYUpload!.uploadedAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Download size={11} />
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                      {doc.agentXUpload && (
                        <div className="mt-2 text-[11px]">
                          <p className="text-slate-700 font-semibold">
                            Agent X: {doc.agentXUpload.name} - {doc.agentXUpload.size}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                viewDocument(
                                  doc.agentXUpload!.name,
                                  doc.agentXUpload!.size,
                                  doc.agentXUpload!.uploadedAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Eye size={11} />
                              View
                            </button>
                            <button
                              onClick={() =>
                                downloadDocumentMeta(
                                  doc.agentXUpload!.name,
                                  doc.agentXUpload!.size,
                                  doc.agentXUpload!.uploadedAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Download size={11} />
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleRequestForCustomer(doc.id, !doc.requestedByAgentX)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                          doc.requestedByAgentX
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {doc.requestedByAgentX ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {doc.requestedByAgentX ? "Requested to Customer" : "Request to Customer"}
                      </button>

                      <button
                        onClick={() => toggleRequestToAgentY(doc.id, !doc.requestedToAgentY)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                          doc.requestedToAgentY
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {doc.requestedToAgentY ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {doc.requestedToAgentY ? "Requested to Agent Y" : "Request to Agent Y"}
                      </button>

                      {doc.requestedToAgentY && !doc.agentYUpload && (
                        <button
                          onClick={() => markReceivedFromAgentY(doc.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 text-xs font-semibold"
                        >
                          Mark Received from Agent Y
                        </button>
                      )}

                      <button
                        onClick={() => triggerManualUpload(doc.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-white text-slate-700 hover:bg-slate-100 px-3 py-2 text-xs font-semibold"
                      >
                        <Upload size={13} />
                        Upload Manually (Agent X)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-xl border bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Agent Y Docs Log</h3>
            {logsForAgentYDocs.length === 0 ? (
              <p className="text-xs text-slate-500">No document logs yet.</p>
            ) : (
              <div className="space-y-2">
                {logsForAgentYDocs.map((log) => (
                  <div key={log.id} className="rounded-lg border bg-slate-50 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-800">{log.action}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {log.actor} - Doc: {log.documentId} - {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <input
          ref={manualInputRef}
          type="file"
          className="hidden"
          onChange={handleManualUpload}
        />

        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <h3 className="text-base font-bold text-slate-900 mb-3">Agent Y Uploaded Documents</h3>
          <div className="space-y-2">
            {state.agentYUploads.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="rounded-lg border bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {file.size} - {file.uploadedAt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
