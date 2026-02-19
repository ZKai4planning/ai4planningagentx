"use client"

import { useParams } from "next/navigation"
import { Download, Eye, FileText, ToggleLeft, ToggleRight } from "lucide-react"
import { useDocumentMediation } from "../documents/store"

export default function CustomerDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? "unknown-project"
  const {
    hydrated,
    requiredForCustomer,
    customerUploads,
    toggleAssignToAgentY,
    markReceivedFromCustomer,
    logsForAgentXDocs,
  } = useDocumentMediation(projectId)

  const viewDocument = (name: string, size: string, uploadedAt: string) => {
    const html = `
      <html>
        <head><title>${name}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2 style="margin-bottom: 8px;">${name}</h2>
          <p style="margin: 0 0 8px 0;">Size: ${size}</p>
          <p style="margin: 0 0 16px 0;">Uploaded At: ${uploadedAt}</p>
          <p style="color: #475569;">Preview is metadata-only in this demo workspace.</p>
        </body>
      </html>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-8 space-y-5">
        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-900">Customer Documents</p>
              </div>
              <span className="rounded-full bg-white border px-2.5 py-1 text-[11px] text-slate-600">
                Project {projectId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Required list comes from Agent Y checklist toggled by Agent X. Customer uploads appear here when received.
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Customer Submitted Documents</h2>
            <span className="text-xs text-slate-500">{requiredForCustomer.length} required</span>
          </div>

          {!hydrated || requiredForCustomer.length === 0 ? (
            <div className="rounded-xl border bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No required documents yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Turn on "Request to Customer" toggles in Agent Y Documents page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requiredForCustomer.map((doc) => (
                <div key={doc.id} className="rounded-xl border bg-slate-50 px-4 py-3">
                  <div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-600 mt-1">{doc.description}</p>
                      {doc.customerUpload ? (
                        <div className="mt-2">
                          <p className="text-xs text-emerald-700 font-semibold">
                            Uploaded: {doc.customerUpload.name} - {doc.customerUpload.size}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() =>
                                viewDocument(
                                  doc.customerUpload!.name,
                                  doc.customerUpload!.size,
                                  doc.customerUpload!.uploadedAt
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Eye size={12} />
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
                              className="inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Download size={12} />
                              Download
                            </button>
                            <button
                              onClick={() => toggleAssignToAgentY(doc.id, !doc.assignedToAgentY)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                                doc.assignedToAgentY
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-white text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {doc.assignedToAgentY ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                              {doc.assignedToAgentY ? "Assigned to Agent Y" : "Assign to Agent Y"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <p className="text-[11px] text-amber-700 font-semibold">
                            Waiting for customer submission
                          </p>
                          <button
                            onClick={() => markReceivedFromCustomer(doc.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5"
                          >
                            Mark Received from Customer
                          </button>
                        </div>
                      )}
                      {!doc.customerUpload && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Allowed: {doc.allowedFileTypes.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <h3 className="text-base font-bold text-slate-900 mb-3">Customer Uploaded Documents</h3>
          {customerUploads.length === 0 ? (
            <p className="text-xs text-slate-500">No uploads from customer yet.</p>
          ) : (
            <div className="space-y-2">
              {customerUploads.map((doc) => (
                <div key={`cust-upload-${doc.id}`} className="rounded-lg border bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {doc.customerUpload?.name} - {doc.customerUpload?.size}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Uploaded at: {doc.customerUpload?.uploadedAt}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        viewDocument(
                          doc.customerUpload!.name,
                          doc.customerUpload!.size,
                          doc.customerUpload!.uploadedAt
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Eye size={12} />
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
                      className="inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Download size={12} />
                      Download
                    </button>
                    <button
                      onClick={() => toggleAssignToAgentY(doc.id, !doc.assignedToAgentY)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                        doc.assignedToAgentY
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {doc.assignedToAgentY ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {doc.assignedToAgentY ? "Assigned to Agent Y" : "Assign to Agent Y"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <h3 className="text-base font-bold text-slate-900 mb-3">Agent X / Customer Docs Log</h3>
          {logsForAgentXDocs.length === 0 ? (
            <p className="text-xs text-slate-500">No logs yet.</p>
          ) : (
            <div className="space-y-2">
              {logsForAgentXDocs.map((log) => (
                <div key={log.id} className="rounded-lg border bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {log.actor} - Doc: {log.documentId} - {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
