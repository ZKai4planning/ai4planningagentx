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
  | "checklist"
  | "eligibility-check"
  | "pending-documents-triggers"
  | "payments-generate-quote"
  | "final-review-check"
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
  currentStageId: "pending-documents-triggers",
  stages: [
    {
      id: "checklist",
      label: "SOP",
       desc: "",
     
      opensSection: "project",
      queryStep: "checklist",
      action: {
        type: "activate-stage",
        label: "Open Eligibility Check",
        targetStageId: "eligibility-check",
        targetSection: "project",
      },
    },
    {
      id: "eligibility-check",
      label: "Eligibility Check",
      desc: "Review the eligibility form and confirm core project details.",
      opensSection: "project",
      queryStep: "eligibility",
      action: {
        type: "activate-stage",
        label: "Open Pending Documents",
        targetStageId: "pending-documents-triggers",
        targetSection: "documents",
      },
    },
    {
      id: "pending-documents-triggers",
      label: "Pending Documents and Triggers",
      desc: "Track documents, compliance, drawings, and trigger follow-ups.",
      opensSection: "documents",
      queryStep: "pending-documents",
      action: {
        type: "activate-stage",
        label: "Generate Quote",
        targetStageId: "payments-generate-quote",
        targetSection: "quote",
      },
    },
    {
      id: "payments-generate-quote",
      label: "Payments (Generate a Quote)",
      desc: "Prepare and share the project quote.",
      opensSection: "quote",
      queryStep: "payments",
      action: {
        type: "activate-stage",
        label: "Start Final Review",
        targetStageId: "final-review-check",
        targetSection: "project",
      },
    },
    {
      id: "final-review-check",
      label: "Final Review & Check",
      desc: "Run the final review before council submission.",
      opensSection: "project",
      queryStep: "final-review",
      action: {
        type: "activate-stage",
        label: "Open Council Submission",
        targetStageId: "council-submission",
        targetSection: "submission",
      },
    },
    {
      id: "council-submission",
      label: "Council Submission",
      desc: "Prepare the final council submission pack.",
      opensSection: "submission",
      queryStep: "submission",
    },
  ],
}

export async function getWorkspaceRoadmap(): Promise<WorkspaceRoadmapResponse> {
  return Promise.resolve(defaultWorkspaceRoadmap)
}
