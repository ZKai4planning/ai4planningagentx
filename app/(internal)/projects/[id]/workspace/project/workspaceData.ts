export const customer = {
  name: "Zafer Khan",
  phone: "0776862279",
  email: "zafer.khan@ai4planning.com",
  location: "42 Brick Lane, London, E1 6RF",
  status: "Active",
}

// Form submission data
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

  // Dimensions from step 2
  existingWidth: "5.4",
  existingDepth: "11.8",
  proposedExtensionDepth: "3.6m",
  proposedExtensionHeight: "3.2m",
  externalMaterials: "Match existing",
  briefDescription:
    "'Single-storey rear extension with open-plan kitchen-dining and rear glazing.",

  // Constraints from step 3
  listedBuilding: "No",
  tpo: "No",
  floodZone: "No",
  vehicleAccess: "Yes",
  preApplicationAdvice: "No",
  additionalConsents: "None",

  // Consultation booking
  consultationBooked: true,
  consultationDate: "February 13, 2026",
  consultationTime: "11:00 AM",
  consultant: "Sarah",
  consultantTitle: "Senior Planning Consultant",
  consultationType: "Verification Session",
  consultationDuration: "15 min video call",
}

export const flow = {
  currentStep: 1,
  steps: [
    { label: "Project Allocated", desc: "Project allocated in workspace" },
    { label: "Project Handed Over to Agent Y", desc: "Project handover initiated." },
    { label: "Received Checklist", desc: "Current stage" },
    { label: "Quote Raised", desc: "Quote generated and shared" },
    { label: "70% Payment Received", desc: "Payment milestone completed" },
    { label: "Document Collection and Review", desc: "Documents collected and reviewed" },
    { label: "Council Submission", desc: "Final stage" },
  ],
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
  timeline: "01 Jan → 30 Jun 2026",
}

export const requirements = {
  propertyType: "Terraced house",
  locationType: "Residential",
  timeline: "4–6 Months",
  scope: ["Single-storey rear extension", "Internal layout modification"],
  constraints: ["Council height regulations", "Neighbour boundary on left"],
  notes: "Client prefers modern elevation and minimal disruption during construction.",
}

export const quote = {
  reference: "QT-UK-2219",
  submittedOn: "18 Feb 2026",
  status: "raised",
  total: "£9,900",
  breakdown: [
    { label: "Consultancy", amount: "£4,200", pct: 42 },
    { label: "Drawings", amount: "£3,100", pct: 31 },
    { label: "Council Fees", amount: "£2,600", pct: 27 },
  ],
}
