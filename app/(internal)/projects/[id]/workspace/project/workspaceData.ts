export type WorkspaceSectionId =
  | "coordination"
  | "requirements"
  | "quote"
  | "documents"
  | "communication"
  | "profile"
  | "payments"
  | "notes"
  | "project"
  | "submission"
  | "dimensions"
  | "constraints"
  | "consultation"

export type WorkspaceStageId =
  | "project-allocated"
  | "eligibility-check"
  | "project-handed-over-to-agent-y"
  | "received-checklist"
  | "quote-raised"
  | "payment-received"
  | "document-collection-review"
  | "council-submission"

export type WorkspaceStageAction =
  | {
      type: "activate-stage"
      label: string
      targetStageId: WorkspaceStageId
      targetSection: WorkspaceSectionId
    }
  | {
      type: "navigate"
      label: string
      hrefTemplate: string
      targetSection?: WorkspaceSectionId
    }

export interface WorkspaceRoadmapStage {
  id: WorkspaceStageId
  label: string
  desc: string
  opensSection: WorkspaceSectionId
  queryStep?: string
  callout?: "assign-agent-y"
  action?: WorkspaceStageAction
}

export interface WorkspaceRoadmapResponse {
  currentStageId: WorkspaceStageId
  stages: WorkspaceRoadmapStage[]
}

export const defaultWorkspaceRoadmap: WorkspaceRoadmapResponse = {
  currentStageId: "project-handed-over-to-agent-y",
  stages: [
    {
      id: "project-allocated",
      label: "Project Allocated",
      desc: "Project allocated in workspace",
      opensSection: "project",
    },
    {
      id: "project-handed-over-to-agent-y",
      label: "Project Handed Over to Agent Y",
      desc: "Project handover initiated.",
      opensSection: "project",
      callout: "assign-agent-y",
    },
    {
      id: "received-checklist",
      label: "Received Checklist",
      desc: "Current stage",
      opensSection: "documents",
      queryStep: "checklist",
      action: {
        type: "activate-stage",
        label: "Raise Quote",
        targetStageId: "quote-raised",
        targetSection: "quote",
      },
    },
    {
      id: "quote-raised",
      label: "Quote Raised",
      desc: "Quote generated and shared",
      opensSection: "quote",
      queryStep: "quote",
      action: {
        type: "activate-stage",
        label: "Mark 70% Payment Received",
        targetStageId: "payment-received",
        targetSection: "payments",
      },
    },
    {
      id: "payment-received",
      label: "70% Payment Received",
      desc: "Payment milestone completed",
      opensSection: "payments",
      queryStep: "payment",
      action: {
        type: "navigate",
        label: "Open Documents",
        hrefTemplate: "/projects/:projectId/workspace/agent-y-documents",
        targetSection: "documents",
      },
    },
    {
      id: "document-collection-review",
      label: "Document Collection and Review",
      desc: "Documents collected and reviewed",
      opensSection: "documents",
      queryStep: "documents",
    },
    {
      id: "council-submission",
      label: "Council Submission",
      desc: "Final stage",
      opensSection: "submission",
    },
  ],
}

export async function getWorkspaceRoadmap(): Promise<WorkspaceRoadmapResponse> {
  return Promise.resolve(defaultWorkspaceRoadmap)
}
