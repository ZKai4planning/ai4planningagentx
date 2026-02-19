"use client"

import { useEffect, useMemo, useState } from "react"

export type UploadedMeta = {
  name: string
  size: string
  uploadedAt: string
}

export type ChecklistDoc = {
  id: string
  name: string
  description: string
  required: boolean
  allowedFileTypes: string[]
  requestedByAgentX: boolean
  requestedToAgentY: boolean
  customerUpload?: UploadedMeta
  agentYUpload?: UploadedMeta
  agentXUpload?: UploadedMeta
  assignedToAgentY: boolean
}

export type DocumentMediationState = {
  checklist: ChecklistDoc[]
  agentYUploads: UploadedMeta[]
  logs: DocumentLog[]
}

export type DocumentLog = {
  id: string
  actor: "Agent Y" | "Agent X" | "Customer"
  action: string
  documentId: string
  timestamp: string
}

const AGENT_Y_CHECKLIST_SEED: Omit<
  ChecklistDoc,
  "requestedByAgentX" | "requestedToAgentY" | "customerUpload" | "assignedToAgentY"
>[] = [
  {
    id: "req-cil-form",
    name: "CIL Form",
    description: "Community Infrastructure Levy (CIL) form for council submission.",
    required: true,
    allowedFileTypes: [".pdf", ".docx"],
  },
  {
    id: "req-location-plan",
    name: "Location Plan",
    description: "Location plan showing site context and boundaries.",
    required: true,
    allowedFileTypes: [".pdf", ".png", ".jpg"],
  },
  {
    id: "req-site-plan",
    name: "Site Plan",
    description: "Scaled location/site plan with boundaries.",
    required: true,
    allowedFileTypes: [".pdf", ".png", ".jpg"],
  },
  {
    id: "req-application-form",
    name: "Application Form",
    description: "Completed planning application form.",
    required: true,
    allowedFileTypes: [".pdf", ".docx"],
  },
  {
    id: "req-ownership-certificate",
    name: "Ownership Certificate",
    description: "Signed ownership certificate from applicant.",
    required: true,
    allowedFileTypes: [".pdf"],
  },
  {
    id: "req-fee-evidence",
    name: "Application Fee Evidence",
    description: "Payment evidence for planning fee.",
    required: true,
    allowedFileTypes: [".pdf", ".png", ".jpg"],
  },
  {
    id: "req-heritage-assessment",
    name: "Heritage Assessment",
    description: "Assessment for heritage or conservation impact.",
    required: false,
    allowedFileTypes: [".pdf"],
  },
  {
    id: "req-biodiversity-report",
    name: "Biodiversity Report",
    description: "Ecology and biodiversity impact report.",
    required: false,
    allowedFileTypes: [".pdf", ".docx"],
  },
]

const AGENT_Y_UPLOADS_SEED: UploadedMeta[] = [
  {
    name: "Existing_Plans_AgentY.pdf",
    size: "1.5 MB",
    uploadedAt: "2026-02-18 10:15 AM",
  },
  {
    name: "Proposed_Elevations_AgentY.pdf",
    size: "2.1 MB",
    uploadedAt: "2026-02-18 11:40 AM",
  },
]

function makeDefaultState(): DocumentMediationState {
  return {
    checklist: [],
    agentYUploads: AGENT_Y_UPLOADS_SEED,
    logs: [],
  }
}

// In-memory project store: shared across workspace pages, reset on full refresh.
const runtimeStateByProject: Record<string, DocumentMediationState> = {}

function getProjectState(projectId: string): DocumentMediationState {
  if (!runtimeStateByProject[projectId]) {
    runtimeStateByProject[projectId] = makeDefaultState()
  }
  return runtimeStateByProject[projectId]
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function createLog(
  actor: "Agent Y" | "Agent X" | "Customer",
  action: string,
  documentId: string
): DocumentLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actor,
    action,
    documentId,
    timestamp: new Date().toISOString(),
  }
}

function isAgentYLog(log: DocumentLog): boolean {
  return log.actor === "Agent Y" || log.action.includes("Agent Y")
}

export function useDocumentMediation(projectId: string) {
  const [state, setState] = useState<DocumentMediationState>(() => getProjectState(projectId))
  const hydrated = true

  useEffect(() => {
    setState(getProjectState(projectId))
  }, [projectId])

  useEffect(() => {
    runtimeStateByProject[projectId] = state
  }, [projectId, state])

  const requiredForCustomer = useMemo(
    () => state.checklist.filter((d) => d.requestedByAgentX),
    [state.checklist]
  )

  const customerUploads = useMemo(
    () => state.checklist.filter((d) => Boolean(d.customerUpload)),
    [state.checklist]
  )

  const agentYChecklistUploads = useMemo(
    () => state.checklist.filter((d) => Boolean(d.agentYUpload)),
    [state.checklist]
  )

  const agentXManualUploads = useMemo(
    () => state.checklist.filter((d) => Boolean(d.agentXUpload)),
    [state.checklist]
  )

  const logsForAgentYDocs = useMemo(
    () => state.logs.filter((log) => isAgentYLog(log)),
    [state.logs]
  )

  const logsForAgentXDocs = useMemo(
    () => state.logs.filter((log) => !isAgentYLog(log)),
    [state.logs]
  )

  const loadChecklistFromAgentY = () => {
    setState((prev) => {
      if (prev.checklist.length > 0) return prev
      return {
        ...prev,
        checklist: AGENT_Y_CHECKLIST_SEED.map((item) => ({
          ...item,
          requestedByAgentX: false,
          requestedToAgentY: false,
          assignedToAgentY: false,
        })),
        logs: [
          ...AGENT_Y_CHECKLIST_SEED.map((item) =>
            createLog("Agent Y", "Checklist item received from Agent Y", item.id)
          ),
          ...prev.logs,
        ],
      }
    })
  }

  const toggleRequestForCustomer = (docId: string, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((doc) =>
        doc.id === docId ? { ...doc, requestedByAgentX: enabled } : doc
      ),
      logs: [
        createLog(
          "Agent X",
          enabled ? "Requested to Customer" : "Request to Customer disabled",
          docId
        ),
        ...prev.logs,
      ],
    }))
  }

  const toggleRequestToAgentY = (docId: string, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((doc) =>
        doc.id === docId ? { ...doc, requestedToAgentY: enabled } : doc
      ),
      logs: [
        createLog(
          "Agent X",
          enabled ? "Requested to Agent Y" : "Request to Agent Y disabled",
          docId
        ),
        ...prev.logs,
      ],
    }))
  }

  const markReceivedFromAgentY = (docId: string) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((doc) =>
        doc.id === docId && doc.requestedToAgentY && !doc.agentYUpload
          ? {
              ...doc,
              agentYUpload: {
                name: `${doc.name.replace(/\s+/g, "_")}_AgentY.pdf`,
                size: "1.4 MB",
                uploadedAt: new Date().toLocaleString(),
              },
            }
          : doc
      ),
      logs: [createLog("Agent Y", "Marked received from Agent Y", docId), ...prev.logs],
    }))
  }

  const uploadManualByAgentX = (docId: string, file: File) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              agentXUpload: {
                name: file.name,
                size: formatBytes(file.size),
                uploadedAt: new Date().toLocaleString(),
              },
            }
          : doc
      ),
      logs: [createLog("Agent X", "Manual document uploaded by Agent X", docId), ...prev.logs],
    }))
  }

  const uploadCustomerDocument = (docId: string, file: File) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((doc) =>
        doc.id === docId && doc.requestedByAgentX
          ? {
              ...doc,
              customerUpload: {
                name: file.name,
                size: formatBytes(file.size),
                uploadedAt: new Date().toLocaleString(),
              },
              assignedToAgentY: false,
            }
          : doc
      ),
      logs: [createLog("Customer", "Customer document uploaded", docId), ...prev.logs],
    }))
  }

  const markReceivedFromCustomer = (docId: string) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((doc) =>
        doc.id === docId && doc.requestedByAgentX && !doc.customerUpload
          ? {
              ...doc,
              customerUpload: {
                name: `${doc.name.replace(/\s+/g, "_")}_Customer.pdf`,
                size: "1.2 MB",
                uploadedAt: new Date().toLocaleString(),
              },
              assignedToAgentY: false,
            }
          : doc
      ),
      logs: [createLog("Customer", "Marked received from customer", docId), ...prev.logs],
    }))
  }

  const toggleAssignToAgentY = (docId: string, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((doc) =>
        doc.id === docId && doc.customerUpload
          ? {
              ...doc,
              assignedToAgentY: enabled,
            }
          : doc
      ),
      logs: [
        createLog(
          "Agent X",
          enabled ? "Requested to Agent Y" : "Request to Agent Y disabled",
          docId
        ),
        ...prev.logs,
      ],
    }))
  }

  return {
    state,
    hydrated,
    requiredForCustomer,
    customerUploads,
    loadChecklistFromAgentY,
    toggleRequestForCustomer,
    toggleRequestToAgentY,
    markReceivedFromAgentY,
    uploadManualByAgentX,
    uploadCustomerDocument,
    toggleAssignToAgentY,
    markReceivedFromCustomer,
    logs: state.logs,
    logsForAgentYDocs,
    logsForAgentXDocs,
    agentYChecklistUploads,
    agentXManualUploads,
  }
}
