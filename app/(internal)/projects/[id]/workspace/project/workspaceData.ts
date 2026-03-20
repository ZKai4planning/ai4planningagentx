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

export const customer = {
  name: "Zafer Khan",
  phone: "0776862279",
  email: "zafer.khan@ai4planning.com",
  location: "42 Brick Lane, London, E1 6RF",
  status: "Active",
}

export const formSubmission = {
  applicantName: "Zafer Khan",
  contactEmail: "zafer.khan@ai4planning.com",
  contactPhone: "0776862279",
  siteAddress: "42 Brick Lane, London",
  postcode: "E1 6RF",
  propertyType: "Detached house",
  ownershipStatus: "Freehold",
  conservationArea: "No",
  purposeOfDevelopment: "Rear extension",
  existingWidth: "5.4",
  existingDepth: "11.8",
  proposedExtensionDepth: "3.6m",
  proposedExtensionHeight: "3.2m",
  externalMaterials: "Match existing",
  briefDescription:
    "Single-storey rear extension with open-plan kitchen-dining and rear glazing.",
  listedBuilding: "No",
  tpo: "No",
  floodZone: "No",
  vehicleAccess: "Yes",
  preApplicationAdvice: "No",
  additionalConsents: "None",
  consultationBooked: true,
  consultationDate: "February 13, 2026",
  consultationTime: "11:00 AM",
  consultant: "Sarah",
  consultantTitle: "Senior Planning Consultant",
  consultationType: "Verification Session",
  consultationDuration: "15 min video call",
}

export const workspaceRoadmapMockResponse: WorkspaceRoadmapResponse = {
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

export async function getMockWorkspaceRoadmap(): Promise<WorkspaceRoadmapResponse> {
  return Promise.resolve(workspaceRoadmapMockResponse)
}

export const project = {
  id: "aB3$k!",
  clientId: "ABC123-089",
  clientName: "Zafer Khan",
  title: "Residential Extension - Brick Lane",
  description: "Adding a rear extension to existing residential property",
  service: "Householder Planning Consent",
  serviceType: "extension",
  serviceNo: "HSPC-UK-007",
  stage: "Pre-Planning",
  location: "42 Brick Lane, London",
  postcode: "E1 6RF",
  status: "architect_assigned",
  createdDate: "2025-12-20",
  updatedDate: "2026-01-20",
  agentX: "James Mitchell",
  agentY: "Rajesh Patel",
  architect: "David Brown",
  progress: 45,
  estimatedCompletionDate: "2026-03-15",
  councilReference: "TOWER/2026/00234",
  councilName: "Tower Hamlets Council",
  timeline: "01 Jan -> 30 Jun 2026",
}

export const requirements = {
  propertyType: "Terraced house",
  locationType: "Residential",
  timeline: "4-6 Months",
  scope: ["Single-storey rear extension", "Internal layout modification"],
  constraints: ["Council height regulations", "Neighbour boundary on left"],
  notes: "Client prefers modern elevation and minimal disruption during construction.",
}

export const quote = {
  reference: "QT-UK-2219",
  submittedOn: "18 Feb 2026",
  status: "raised",
  total: "GBP 9,900",
  breakdown: [
    { label: "Consultancy", amount: "GBP 4,200", pct: 42 },
    { label: "Drawings", amount: "GBP 3,100", pct: 31 },
    { label: "Council Fees", amount: "GBP 2,600", pct: 27 },
  ],
}
