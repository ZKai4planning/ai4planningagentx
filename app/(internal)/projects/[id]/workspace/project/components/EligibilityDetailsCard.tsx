"use client"

import { type RefObject, useRef, useState } from "react"
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Droplets,
  ExternalLink,
  FileCheck,
  Home,
  Info,
  Ruler,
  Shield,
} from "lucide-react"
import {
  eligibilityFieldMappings,
  eligibilityResourceMappings,
  getEligibilityApplicantName,
  getEligibilityFieldValue,
  getEligibilityResourceValue,
  getEligibilitySiteAddress,
} from "@/lib/eligibility"

type EligibilityCompletionStep = {
  step: number
  key: string
  label: string
  completed: boolean
}

type EligibilityData = Record<string, unknown> & {
  _id: string
  projectId: string
  status: string
  currentStep: number
  createdAt: string
  updatedAt: string
  completionStatus: {
    totalSteps: number
    completedSteps: number
    percentage: number
    isCompleted: boolean
    nextStep: number | null
    steps: EligibilityCompletionStep[]
  }
}

type EligibilityFieldKey = keyof typeof eligibilityFieldMappings
type EligibilityResourceKey = keyof typeof eligibilityResourceMappings
type Tone = "blue" | "indigo" | "amber" | "emerald"
type QuestionKind =
  | "default"
  | "block"
  | "resource"
  | "bundle"
  | "declaration"
  | "signature"
type AgentZKey =
  | EligibilityFieldKey
  | EligibilityResourceKey
  | "safetyComplianceDocuments"
  | "digitalSignature"

type ResourceLink = {
  label: string
  href: string
}

type BundleItemDefinition = {
  label: string
  fieldKey?: EligibilityFieldKey
  resourceKey?: EligibilityResourceKey
  getValue?: (eligibility: EligibilityData) => string
}

type DetailedQuestion = {
  number: number
  label: string
  kind?: QuestionKind
  fieldKey?: EligibilityFieldKey
  resourceKey?: EligibilityResourceKey
  bundleItems?: BundleItemDefinition[]
  agentZ?: AgentZKey
  agentZLabel?: string
  helperText?: string
  emptyPrompt?: string
  getValue?: (eligibility: EligibilityData) => string
}

type DetailedSection = {
  title: string
  questions: DetailedQuestion[]
}

type AccordionStep = {
  id: string
  number: number
  title: string
  tone: Tone
  sections: DetailedSection[]
}

type AgentZPlaybookEntry = {
  title: string
  description: string
  questionHelp?: string
  customerOptions?: string[]
  agentXResponses?: string[]
  uploadSupportPrompt?: string
  insights: string[]
  triggers: string[]
}

type BuiltBundleItem = {
  label: string
  value: string
  links: ResourceLink[]
  answered: boolean
}

type BuiltQuestionRow = {
  number: number
  label: string
  kind: QuestionKind
  value: string
  answered: boolean
  helperText?: string
  emptyPrompt?: string
  resourceLinks: ResourceLink[]
  bundleItems: BuiltBundleItem[]
  agentZKey: AgentZKey | null
  agentZLabel?: string
  agentZSelected: boolean
}

type EligibilityDetailsCardProps = {
  eligibilityData: EligibilityData | null
  loading: boolean
  projectId?: string
  projectServiceName?: string
}

const STEP_ONE_SECTIONS: DetailedSection[] = [
  {
    title: "Applicant Details",
    questions: [
      { number: 1, label: "Applicant First Name", fieldKey: "applicantFirstName" },
      { number: 2, label: "Applicant Middle Name", fieldKey: "applicantMiddleName" },
      { number: 3, label: "Applicant Last Name", fieldKey: "applicantLastName" },
      { number: 4, label: "Email Address", fieldKey: "emailAddress" },
      {
        number: 5,
        label: "Phone Number",
        fieldKey: "phoneNumber",
        getValue: (eligibility) => getPhoneDisplayValue(eligibility),
      },
      { number: 6, label: "Site Address Line 1", fieldKey: "siteAddressLine1" },
      { number: 7, label: "Site Address Line 2", fieldKey: "siteAddressLine2" },
      { number: 8, label: "Council", fieldKey: "council" },
      { number: 9, label: "Postcode", fieldKey: "postcode" },
      {
        number: 10,
        label: "Alternate address for correspondence?",
        fieldKey: "useAlternateCorrespondenceAddress",
      },
      {
        number: 11,
        label: "Correspondence Address Line 1",
        fieldKey: "correspondenceAddressLine1",
      },
      {
        number: 12,
        label: "Correspondence Address Line 2",
        fieldKey: "correspondenceAddressLine2",
      },
      {
        number: 13,
        label: "Correspondence Postcode",
        fieldKey: "correspondencePostcode",
      },
    ],
  },
  {
    title: "Pre-Application Check",
    questions: [
      {
        number: 14,
        label: "Have you previously applied to the council?",
        fieldKey: "hasPreviousCouncilApplication",
      },
      {
        number: 15,
        label:
          "What was previously proposed, and was it approved, refused, or withdrawn?",
        fieldKey: "previousProposalDetails",
        kind: "block",
      },
      {
        number: 16,
        label: "Planning Reference Number",
        fieldKey: "planningReferenceNumber",
      },
      { number: 17, label: "Type of Application", fieldKey: "previousApplicationType" },
      {
        number: 18,
        label: "Type of Development Previously Proposed",
        fieldKey: "previousDevelopmentType",
      },
      {
        number: 19,
        label:
          "Is this project similar to the previous application or different this time?",
        fieldKey: "projectComparison",
        kind: "block",
      },
    ],
  },
  {
    title: "Property & Ownership",
    questions: [
      {
        number: 20,
        label: "Property Type",
        fieldKey: "propertyType",
        agentZ: "propertyType",
        agentZLabel: "Other / Ask Agent Z",
      },
      {
        number: 21,
        label: "Ownership Status",
        fieldKey: "ownershipStatus",
        agentZ: "ownershipStatus",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 22,
        label: "Are you planning any building works?",
        fieldKey: "purposeOfDevelopment",
        agentZ: "purposeOfDevelopment",
        agentZLabel: "Unsure / Ask Agent Z",
      },
      {
        number: 23,
        label: "Has the property already been extended before?",
        fieldKey: "previouslyExtended",
        agentZ: "previouslyExtended",
        agentZLabel: "Unsure / Ask Agent Z",
      },
    ],
  },
  {
    title: "Current Use Status",
    questions: [
      {
        number: 24,
        label: "How is the property currently used?",
        fieldKey: "currentUseStatus",
      },
      {
        number: 25,
        label: "How many people currently live there?",
        fieldKey: "currentOccupantsCount",
      },
      {
        number: 26,
        label: "Are they one family or separate households?",
        fieldKey: "currentHouseholdArrangement",
      },
    ],
  },
  {
    title: "Proposed HMO Use",
    questions: [
      {
        number: 27,
        label: "How many occupants do you plan to accommodate?",
        fieldKey: "plannedOccupantsCount",
      },
      {
        number: 28,
        label: "Will occupants share kitchen/bathroom?",
        fieldKey: "sharedKitchenBathroom",
        agentZ: "sharedKitchenBathroom",
        agentZLabel: "Don't know / Ask Agent Z",
      },
      {
        number: 29,
        label: "Will rooms be rented individually?",
        fieldKey: "roomsRentedIndividually",
        agentZ: "roomsRentedIndividually",
        agentZLabel: "Don't know / Ask Agent Z",
      },
    ],
  },
]

const STEP_TWO_SECTIONS: DetailedSection[] = [
  {
    title: "Room Layout Check",
    questions: [
      {
        number: 30,
        label: "Number of bedrooms available?",
        fieldKey: "availableBedroomsCount",
      },
      {
        number: 31,
        label: "Number of bathrooms / shower rooms?",
        fieldKey: "bathroomsOrShowerRoomsCount",
      },
      {
        number: 32,
        label: "Is there a communal kitchen?",
        fieldKey: "hasCommunalKitchen",
        agentZ: "hasCommunalKitchen",
        agentZLabel: "Planning to create one / Ask Agent Z can help you",
      },
      {
        number: 33,
        label: "Is any lounge/dining room proposed as a bedroom?",
        fieldKey: "loungeDiningRoomAsBedroom",
      },
    ],
  },
  {
    title: "Description of Works",
    questions: [
      {
        number: 34,
        label: "Description of Proposed Works",
        fieldKey: "proposedWorksDescription",
        kind: "block",
        agentZ: "proposedWorksDescription",
        agentZLabel: "Ask Agent Z to Summarize",
        helperText:
          "Summarise the proposal, including size, number of storeys and position.",
      },
    ],
  },
  {
    title: "Dimensions",
    questions: [
      {
        number: 35,
        label: "Total internal floor area",
        fieldKey: "totalInternalFloorArea",
      },
      { number: 36, label: "Number of floors", fieldKey: "numberOfFloors" },
      {
        number: 37,
        label: "Existing Property Width (m)",
        fieldKey: "existingPropertyWidthM",
      },
      {
        number: 38,
        label: "Existing Property Depth (m)",
        fieldKey: "existingPropertyDepthM",
      },
      {
        number: 39,
        label: "Proposed Extension Width (m)",
        fieldKey: "proposedExtensionWidthM",
      },
      {
        number: 40,
        label: "Proposed Extension Depth (m)",
        fieldKey: "proposedExtensionDepthM",
      },
      {
        number: 41,
        label: "Garden depth (metres)",
        fieldKey: "gardenDepth",
      },
      {
        number: 42,
        label: "Ridge / Eaves Height (m)",
        fieldKey: "ridgeOrEavesHeightM",
      },
      {
        number: 43,
        label: "Distance from Boundary (m)",
        fieldKey: "distanceFromBoundaryM",
      },
      {
        number: 44,
        label: "Kitchen Room Dimensions (metres)",
        getValue: (eligibility) =>
          formatPairedDimensionValue(
            formatEligibilityFieldValue(eligibility, "kitchenRoomLengthM"),
            formatEligibilityFieldValue(eligibility, "kitchenRoomWidthM")
          ),
      },
      {
        number: 45,
        label: "Bathroom Room Dimensions (metres)",
        getValue: (eligibility) =>
          formatPairedDimensionValue(
            formatEligibilityFieldValue(eligibility, "bathroomRoomLengthM"),
            formatEligibilityFieldValue(eligibility, "bathroomRoomWidthM")
          ),
      },
      {
        number: 46,
        label: "Approx smallest bedroom size?",
        fieldKey: "smallestBedroomSize",
      },
    ],
  },
  {
    title: "Current Materials Used",
    questions: [
      {
        number: 47,
        label: "Wall Materials",
        fieldKey: "wallMaterials",
        agentZ: "wallMaterials",
        agentZLabel: "Not decided / Ask Agent Z",
      },
      {
        number: 48,
        label: "Roof Materials",
        fieldKey: "roofMaterials",
        agentZ: "roofMaterials",
        agentZLabel: "Not decided / Ask Agent Z",
      },
      {
        number: 49,
        label: "Colour / Finish Notes (optional)",
        fieldKey: "colourOrFinishNotes",
      },
      {
        number: 50,
        label: "Materials match existing?",
        fieldKey: "materialsMatchExisting",
        agentZ: "materialsMatchExisting",
        agentZLabel: "Ask Agent Z",
      },
    ],
  },
  {
    title: "Plans, Drawings & Photographs",
    questions: [
      {
        number: 51,
        label: "Location Plan (1:1250 or 1:2500)",
        kind: "resource",
        resourceKey: "locationPlan",
        agentZ: "locationPlan",
        helperText: "Ordnance Survey based plan showing site in context",
        emptyPrompt:
          "No location plan uploaded yet. Agent Z can help you decide the next action or required support.",
      },
      {
        number: 52,
        label: "Site Plan (1:200 or 1:500)",
        kind: "resource",
        resourceKey: "sitePlan",
        agentZ: "sitePlan",
        helperText: "Block plan of the site showing proposed development",
        emptyPrompt:
          "No site plan uploaded yet. Agent Z can help you understand what needs to be prepared.",
      },
      {
        number: 53,
        label: "Existing & Proposed Elevations",
        kind: "resource",
        resourceKey: "existingAndProposedElevations",
        agentZ: "existingAndProposedElevations",
        helperText: "All affected elevations at 1:50 or 1:100",
        emptyPrompt:
          "No elevations are connected yet. Agent Z can help clarify whether these drawings are needed next.",
      },
      {
        number: 54,
        label: "Photographs of Site",
        kind: "resource",
        resourceKey: "photographsOfSite",
        agentZ: "photographsOfSite",
        helperText: "Current site photos showing all elevations",
        emptyPrompt:
          "No photographs are connected yet. Agent Z can help define the useful views to request.",
      },
      {
        number: 55,
        label: "Additional Drawings (floor plans, sections etc.)",
        kind: "resource",
        resourceKey: "additionalDrawings",
        agentZ: "additionalDrawings",
        helperText: "Any other supporting drawings",
        emptyPrompt:
          "No additional drawings are connected yet. Agent Z can help identify which extras would strengthen the case.",
      },
    ],
  },
]

const STEP_THREE_SECTIONS: DetailedSection[] = [
  {
    title: "Heritage & Listing",
    questions: [
      {
        number: 56,
        label: "Conservation Area or Near Listed Building?",
        fieldKey: "nearConservationAreaOrListedBuilding",
        agentZ: "nearConservationAreaOrListedBuilding",
        agentZLabel: "Ask Agent Z",
      },
    ],
  },
  {
    title: "Access & Parking",
    questions: [
      {
        number: 57,
        label: "New or altered vehicle access?",
        fieldKey: "newOrAlteredAccess",
      },
      {
        number: 58,
        label: "Details of Access / Parking Changes",
        fieldKey: "accessOrParkingChanges",
        kind: "block",
      },
      {
        number: 59,
        label: "Number of Proposed Parking Spaces",
        fieldKey: "proposedParkingSpaces",
      },
      {
        number: 60,
        label: "Cycle storage provided?",
        fieldKey: "cycleStorageProvisions",
      },
    ],
  },
  {
    title: "Trees, Hedges & Landscaping",
    questions: [
      {
        number: 61,
        label: "Trees with TPO on or near site?",
        fieldKey: "treesWithTPO",
      },
      {
        number: 62,
        label: "Trees within falling distance of works?",
        fieldKey: "treesWithinFallingDistance",
        agentZ: "treesWithinFallingDistance",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 63,
        label: "Tree Species (if known)",
        fieldKey: "treeSpecies",
      },
      {
        number: 64,
        label: "Approximate Tree Height (m)",
        fieldKey: "approximateTreeSizeM",
      },
      {
        number: 65,
        label: "Arboriculture Report / BS5837 Report (if available)",
        kind: "resource",
        resourceKey: "treeSurveyReport",
        agentZ: "treeSurveyReport",
        helperText:
          "Plan showing tree positions, root protection areas and species",
        emptyPrompt:
          "No tree report is connected yet. Agent Z can help explain when councils usually expect a BS5837 report.",
      },
    ],
  },
  {
    title: "Flood & Environmental Risk",
    questions: [
      {
        number: 66,
        label: "Is the site in Flood Zone 2 or 3?",
        fieldKey: "isSiteInFloodRiskArea",
        agentZ: "isSiteInFloodRiskArea",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 67,
        label: "Any known contamination on site?",
        fieldKey: "isSiteContaminatedLand",
        agentZ: "isSiteContaminatedLand",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 68,
        label: "Flood Risk Assessment (if available)",
        kind: "resource",
        resourceKey: "floodRiskAssessmentReport",
        agentZ: "floodRiskAssessmentReport",
        helperText: "Required for sites in Flood Zone 2 or 3",
        emptyPrompt:
          "No flood risk assessment is connected yet. Agent Z can help explain whether the site is likely to need one.",
      },
    ],
  },
]

const STEP_FOUR_SECTIONS: DetailedSection[] = [
  {
    title: "Safety & Compliance",
    questions: [
      {
        number: 69,
        label: "Do you currently have smoke alarms installed?",
        fieldKey: "smokeAlarmsInstalled",
        agentZ: "smokeAlarmsInstalled",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 70,
        label: "Do you have a valid Gas Safety Certificate?",
        fieldKey: "gasSafetyCertificate",
        agentZ: "gasSafetyCertificate",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 71,
        label: "Do you have a valid Electrical Report (EICR)?",
        fieldKey: "electricalReportEicr",
        agentZ: "electricalReportEicr",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 72,
        label: "EPC available?",
        fieldKey: "epcAvailable",
        agentZ: "epcAvailable",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 73,
        label: "Upload safety & compliance documents",
        kind: "bundle",
        helperText:
          "Upload the Gas Safety Certificate, Electrical Report (EICR), and EPC if available.",
        emptyPrompt:
          "The document upload payload is not connected in this workspace yet, but Agent Z can still guide what is usually needed next.",
        bundleItems: [
          { label: "Gas Safety Certificate", fieldKey: "gasSafetyCertificate" },
          { label: "Electrical Report (EICR)", fieldKey: "electricalReportEicr" },
          { label: "EPC Certificate", fieldKey: "epcAvailable" },
        ],
      },
    ],
  },
  {
    title: "Utilities & Waste",
    questions: [
      {
        number: 74,
        label: "Water Supply",
        fieldKey: "waterSupply",
        agentZ: "waterSupply",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 75,
        label: "Sewage / Drainage",
        fieldKey: "sewageOrDrainage",
        agentZ: "sewageOrDrainage",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 76,
        label: "Surface Water Drainage",
        fieldKey: "surfaceWaterDrainage",
        agentZ: "surfaceWaterDrainage",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 77,
        label: "Existing Waste Arrangements",
        fieldKey: "existingWasteArrangements",
        kind: "block",
        agentZ: "existingWasteArrangements",
        agentZLabel: "Ask Agent Z",
        emptyPrompt:
          "Agent Z can explain what councils usually expect for bin storage, collection access, and waste arrangements.",
      },
      {
        number: 78,
        label: "Renewable energy installations proposed?",
        fieldKey: "renewableEnergyProposals",
        agentZ: "renewableEnergyProposals",
        agentZLabel: "Ask Agent Z",
      },
      {
        number: 79,
        label: "Details of Renewable / Energy Measures (if applicable)",
        fieldKey: "renewableEnergyDetails",
        kind: "block",
      },
    ],
  },
  {
    title: "Ownership Certificate",
    questions: [
      {
        number: 80,
        label: "Which Ownership Certificate applies?",
        fieldKey: "certificateOfOwnership",
        agentZ: "certificateOfOwnership",
        agentZLabel: "Ask Agent Z / need advice",
      },
      {
        number: 81,
        label: "Names & Addresses of Other Owners (if Certificate B, C or D)",
        fieldKey: "ownershipDetails",
        kind: "block",
      },
    ],
  },
  {
    title: "Additional Consents Required",
    questions: [
      {
        number: 82,
        label: "Additional Consents",
        fieldKey: "additionalConsents",
        kind: "block",
        agentZ: "additionalConsents",
        agentZLabel: "Ask Agent Z / need advice",
      },
    ],
  },
  {
    title: "Community Consultation / Neighbours Notified?",
    questions: [
      {
        number: 83,
        label: "Community consultation undertaken?",
        fieldKey: "communityConsultation",
      },
    ],
  },
]

const STEP_FIVE_SECTIONS: DetailedSection[] = [
  {
    title: "Review & Declarations",
    questions: [
      {
        number: 84,
        label:
          "The information given in this application is correct and accurate to the best of my knowledge.",
        fieldKey: "informationAccurate",
        kind: "declaration",
      },
      {
        number: 85,
        label:
          "I am the owner/occupier of the application site, or I have the authority of the owner/occupier to make this application.",
        fieldKey: "authorityConfirmed",
        kind: "declaration",
      },
      {
        number: 86,
        label:
          "I understand that planning permission, if granted, does not authorise any infringement of private rights.",
        fieldKey: "privateRightsAcknowledged",
        kind: "declaration",
      },
      {
        number: 87,
        label:
          "I consent to the information in this application being used for planning purposes and being made publicly available.",
        fieldKey: "publicDataConsent",
        kind: "declaration",
      },
      {
        number: 88,
        label:
          "I understand that a fee may be payable and I agree to pay any fees required.",
        fieldKey: "feeAgreementAccepted",
        kind: "declaration",
      },
    ],
  },
  {
    title: "Digital Signature",
    questions: [
      {
        number: 89,
        label: "Full Name of Signatory",
        fieldKey: "signatoryFullName",
      },
      {
        number: 90,
        label: "Date (dd/mm/yyyy)",
        fieldKey: "signedDate",
      },
      {
        number: 91,
        label: "Capacity (Owner / Agent / Other)",
        fieldKey: "signatoryCapacity",
      },
      {
        number: 92,
        label: "Digital Signature",
        kind: "signature",
        helperText:
          "Draw your normal signature inside the box using your mouse, finger, or stylus.",
      },
    ],
  },
]

const ACCORDION_STEPS: AccordionStep[] = [
  {
    id: "step-1",
    number: 1,
    title: "Applicant & Property",
    tone: "blue",
    sections: STEP_ONE_SECTIONS,
  },
  {
    id: "step-2",
    number: 2,
    title: "Works & Materials",
    tone: "indigo",
    sections: STEP_TWO_SECTIONS,
  },
  {
    id: "step-3",
    number: 3,
    title: "Site Constraints",
    tone: "amber",
    sections: STEP_THREE_SECTIONS,
  },
  {
    id: "step-4",
    number: 4,
    title: "Utilities & Consents",
    tone: "emerald",
    sections: STEP_FOUR_SECTIONS,
  },
  {
    id: "step-5",
    number: 5,
    title: "Declarations",
    tone: "blue",
    sections: STEP_FIVE_SECTIONS,
  },
]

const AGENT_Z_PLAYBOOK: Partial<Record<AgentZKey, AgentZPlaybookEntry>> = {
  propertyType: {
    title: "Property type guidance",
    description:
      "Agent Z helps interpret which property type best matches the building before downstream planning advice is framed.",
    questionHelp:
      "Use this when the customer is not sure whether the site is best described as a house, flat, converted building, or something less standard.",
    customerOptions: [
      "House / dwelling",
      "Flat / maisonette",
      "Converted or mixed setup",
      "Other / Ask Agent Z",
    ],
    agentXResponses: [
      "Explain the closest matching property type based on the saved layout and current use answers.",
      "Ask one short clarifying question if the building form is still ambiguous.",
      "Recommend 'Other / Ask Agent Z' only when the property does not cleanly fit the standard types.",
    ],
    insights: [
      "Property type changes how later HMO and planning answers are interpreted.",
      "A wrong property type can make later document requests feel inconsistent.",
      "This is a strong early classification question, not just a label field.",
    ],
    triggers: [
      "The customer is switching between more than one property description.",
      "The saved layout and the chosen property type do not look aligned.",
      "Agent X wants a cleaner explanation before responding back.",
    ],
  },
  ownershipStatus: {
    title: "Ownership status guidance",
    description:
      "Agent Z helps explain which ownership position best reflects the customer so the application route stays consistent.",
    questionHelp:
      "This question is about whether the customer owns, jointly owns, manages, or otherwise controls the site well enough to apply.",
    customerOptions: [
      "Owner occupier",
      "Landlord / owner",
      "Agent acting for owner",
      "Unsure who should be selected",
    ],
    agentXResponses: [
      "Clarify whether the customer owns the site directly or is acting on behalf of someone else.",
      "Recommend the ownership status that best matches the signatory and certificate answers.",
      "Flag when the ownership answer should be checked again before submission.",
    ],
    insights: [
      "Ownership answers should stay consistent with the later certificate and declaration section.",
      "This answer can affect how supporting authority is described later.",
      "It is better to resolve ownership ambiguity early than at submission time.",
    ],
    triggers: [
      "The customer is unsure whether they are applying as owner or agent.",
      "The signatory or ownership certificate answers point in a different direction.",
      "Agent X needs a safe explanation before advising the customer.",
    ],
  },
  purposeOfDevelopment: {
    title: "Building works scope",
    description:
      "Agent Z can help interpret whether the selected works change the planning or HMO route.",
    questionHelp:
      "This is the first place to confirm whether the project is a use change only, physical works, or both.",
    customerOptions: [
      "Rear, side, loft, or internal works",
      "Use change with little or no building work",
      "Several work types together",
      "Unsure / Ask Agent Z",
    ],
    agentXResponses: [
      "Summarise the likely work category from the customer's earlier answers.",
      "Explain whether the answer suggests plans and dimensions will be needed next.",
      "Use Agent Z when the customer is mixing use-change and building-work language together.",
    ],
    insights: [
      "The work type can change what plans, measurements, and supporting evidence are needed next.",
      "Mixed scopes often need a clearer summary before the project reaches specialist review.",
      "A better works summary usually reduces back-and-forth later in the workflow.",
    ],
    triggers: [
      "The customer selected multiple work types or described the scope loosely.",
      "The answer materially changes the planning or licensing route.",
      "Agent X needs a quick recommendation before the next step progresses.",
    ],
  },
  previouslyExtended: {
    title: "Previous extension history",
    description:
      "Agent Z can flag how existing extensions may affect available rights, precedent, and future works expectations.",
    questionHelp:
      "Use this when the customer is not sure whether earlier extensions, loft works, or outbuildings already count against the site history.",
    customerOptions: ["Yes", "No", "Unsure / Ask Agent Z"],
    agentXResponses: [
      "Explain why previous works on site matter before the new proposal is assessed.",
      "Suggest checking old approvals, drawings, or sale particulars if the history is unclear.",
      "Flag the answer for follow-up when the site history could change feasibility.",
    ],
    insights: [
      "Historic extensions can reduce the headroom for new development.",
      "Site history often changes what evidence or drawings the team should verify next.",
      "This answer is especially important when the customer is unsure what already exists on site.",
    ],
    triggers: [
      "The site history is uncertain or seems inconsistent with the rest of the answers.",
      "The answer may change feasibility expectations.",
      "The next review depends on whether earlier extensions already count toward site limits.",
    ],
  },
  sharedKitchenBathroom: {
    title: "Shared facilities check",
    description:
      "Agent Z can help interpret whether the proposed setup behaves more like a shared HMO arrangement.",
    questionHelp:
      "This question is about whether occupants will rely on shared amenities instead of fully self-contained facilities.",
    customerOptions: ["Yes", "No", "Don't know / Ask Agent Z"],
    agentXResponses: [
      "Explain how shared facilities can indicate a more typical HMO arrangement.",
      "Ask whether the kitchen and bathroom are shared by separate occupiers or one household.",
      "Recommend Agent Z when the customer is unsure how the rooms will operate in practice.",
    ],
    insights: [
      "Shared kitchen and bathroom arrangements often affect HMO classification and amenity review.",
      "This answer should align with the occupancy and room-rental answers.",
      "Agent Z can help frame the right follow-up question if the customer is undecided.",
    ],
    triggers: [
      "The customer selected an unsure answer path.",
      "The occupancy model needs clarification before case review.",
      "The answer changes likely licensing expectations.",
    ],
  },
  roomsRentedIndividually: {
    title: "Individual room rental check",
    description:
      "Agent Z can assess whether the occupancy model suggests a clearer HMO use pattern.",
    questionHelp:
      "This is about whether occupants will rent separate bedrooms individually rather than occupy the whole property together.",
    customerOptions: ["Yes", "No", "Don't know / Ask Agent Z"],
    agentXResponses: [
      "Explain why separate room lets are a strong signal for HMO-style occupation.",
      "Check whether the proposed occupant count and kitchen-sharing answers still match.",
      "Use Agent Z when the customer has not decided the final letting model yet.",
    ],
    insights: [
      "Individual room rental is a strong signal for HMO-related review.",
      "This answer can change both licensing and supporting-document expectations.",
      "A mismatch here is usually worth resolving before the case moves forward.",
    ],
    triggers: [
      "The letting model is unclear or inconsistent with the other occupancy answers.",
      "Agent X needs decision support before advancing the workspace stage.",
      "The team wants a fast recommendation on likely HMO use implications.",
    ],
  },
  hasCommunalKitchen: {
    title: "Communal kitchen guidance",
    description:
      "Agent Z can help interpret whether the property layout supports a communal kitchen arrangement.",
    questionHelp:
      "Use this when the customer is planning a new communal kitchen or is not sure whether the proposed room arrangement qualifies as one.",
    customerOptions: ["Yes", "No", "Planning to create one / Ask Agent Z can help you"],
    agentXResponses: [
      "Explain how a communal kitchen affects the practical HMO layout review.",
      "Suggest checking whether bedroom count, bathrooms, and shared-use answers still fit together.",
      "Use Agent Z when the customer is proposing a layout change rather than describing the current one.",
    ],
    insights: [
      "Communal kitchens often link directly to occupancy strategy and amenity expectations.",
      "This answer should be checked against bedroom count, bathrooms, and proposed HMO use.",
      "A clearer answer here usually improves the later works summary.",
    ],
    triggers: [
      "The customer is planning to create one but is not fully sure of the implication.",
      "The answer affects layout interpretation.",
      "Agent X wants a quick layout-based recommendation.",
    ],
  },
  proposedWorksDescription: {
    title: "Proposal summary support",
    description:
      "Agent Z can turn partial project notes into a cleaner planning summary that Agent X can reuse.",
    questionHelp:
      "The summary should usually mention the existing property, proposed works, likely scale, and intended HMO or planning outcome.",
    customerOptions: [
      "Write a short summary manually",
      "Give Agent Z rough notes to summarise",
      "Refine an existing draft",
    ],
    agentXResponses: [
      "Return a concise two- or three-sentence summary suitable for the workspace.",
      "Highlight any missing dimensions, location, or use details still needed for a stronger summary.",
      "Rewrite vague customer notes into clearer planning language without overstating facts.",
    ],
    insights: [
      "A concise summary makes later internal review faster and more consistent.",
      "The best summaries usually mention scale, position, and intended use together.",
      "This answer often becomes the anchor text for later planning discussions.",
    ],
    triggers: [
      "The description is long, fragmented, or still incomplete.",
      "The team wants a better internal summary before the next stage.",
      "The customer has provided enough detail for synthesis but not for a final narrative.",
    ],
  },
  wallMaterials: {
    title: "Wall materials guidance",
    description:
      "Agent Z helps explain how to describe the external wall material when the customer has not decided yet.",
    questionHelp:
      "This question usually refers to the visible external finish for the proposed works, such as brick, render, cladding, or a matching finish.",
    customerOptions: ["Brick", "Render / cladding", "Match existing", "Not decided / Ask Agent Z"],
    agentXResponses: [
      "Suggest a simple material description based on the existing property and proposed works.",
      "Explain when 'match existing' is the safest answer to use at this stage.",
      "Flag when elevations or site photos would help confirm the finish.",
    ],
    insights: [
      "Material descriptions are often reviewed together with elevations and photographs.",
      "Undecided materials can still be handled well if the likely approach is explained clearly.",
      "A vague material answer is usually better fixed now than later in planning review.",
    ],
    triggers: [
      "The customer has not yet chosen the external finish.",
      "The proposed works involve visible changes that need a clearer material description.",
      "Agent X wants to recommend a safe interim wording.",
    ],
  },
  roofMaterials: {
    title: "Roof materials guidance",
    description:
      "Agent Z helps interpret the likely roof finish when the customer is still deciding how the proposal should look.",
    questionHelp:
      "This usually means the roof covering for new or altered roof areas, for example tile, slate, flat roof membrane, or matching existing.",
    customerOptions: ["Tile / slate", "Flat roof material", "Match existing", "Not decided / Ask Agent Z"],
    agentXResponses: [
      "Suggest a concise roof-material answer that fits the visible roof change being proposed.",
      "Explain when matching the existing roof is usually the simplest route.",
      "Recommend a follow-up only if the roof design is materially different or still unclear.",
    ],
    insights: [
      "Roof materials matter most when the proposed works alter the visible roof form.",
      "A matching approach is often easier to explain where the design intent is continuity.",
      "This answer is stronger when it aligns with elevations and description of works.",
    ],
    triggers: [
      "The customer has not settled on the roof finish.",
      "The roof proposal may look different from the existing building.",
      "Agent X needs a safe recommendation before more drawings arrive.",
    ],
  },
  materialsMatchExisting: {
    title: "Material compatibility",
    description:
      "Agent Z can help explain why matching or contrasting materials may matter in review.",
    questionHelp:
      "This question is asking whether the proposed walls, roof, and visible finishes will broadly continue the existing appearance of the property.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain whether the current design intent sounds like a matching or contrasting approach.",
      "Suggest a short justification if the proposed material palette will differ.",
      "Recommend checking elevations and photographs before finalising the answer.",
    ],
    insights: [
      "Material consistency can affect planning acceptability and visual integration.",
      "If materials differ, the explanation usually needs to be stronger.",
      "This answer is more useful when assessed alongside elevations and site photos.",
    ],
    triggers: [
      "The material approach is undecided.",
      "The answer affects how the proposal is likely to be explained.",
      "Agent X wants help deciding whether more detail should be requested.",
    ],
  },
  locationPlan: {
    title: "Location plan support",
    description:
      "Agent Z can clarify when a location plan is needed and what it should show.",
    questionHelp:
      "A location plan is usually an Ordnance Survey-based drawing showing the site in its wider context.",
    customerOptions: ["Yes, open Agent Z support", "No, not right now"],
    agentXResponses: [
      "Explain whether a location plan is typically expected at this stage.",
      "List the basic site-context information the plan should show.",
      "Advise whether the team should request preparation, upload, or confirmation from the customer.",
    ],
    uploadSupportPrompt:
      "Agent can help. No location plan uploaded yet. Would you like Agent Z to help arrange or prepare your location plan?",
    insights: [
      "Location plans usually establish the site in context before more detailed drawings are reviewed.",
      "Missing plans often stall case progress more than small text-field gaps.",
      "A clear plan request can save a full extra loop with the customer.",
    ],
    triggers: [
      "No location plan is connected yet.",
      "The team wants to confirm whether the plan is needed now or later.",
      "Agent X needs a cleaner request back to the customer or supplier.",
    ],
  },
  sitePlan: {
    title: "Site plan support",
    description:
      "Agent Z can explain the purpose of the site plan and what details typically matter.",
    questionHelp:
      "A site or block plan usually shows the property, boundaries, access, and the area affected by the proposed development.",
    customerOptions: ["Yes, open Agent Z support", "No, not right now"],
    agentXResponses: [
      "Explain whether the current proposal needs a site plan now.",
      "List the practical details a useful site plan should cover.",
      "Advise whether to request a prepared drawing or wait for other information first.",
    ],
    uploadSupportPrompt:
      "Agent can help. No site plan uploaded yet. Would you like Agent Z to help prepare or arrange your site plan?",
    insights: [
      "Site plans often become important when access, layout, or relationship to boundaries matters.",
      "The most useful next action is usually deciding whether a block plan is already sufficient.",
      "This works best when reviewed together with the description of works.",
    ],
    triggers: [
      "No site plan is connected yet.",
      "The proposal needs better positional clarity.",
      "The team wants help deciding what to request next.",
    ],
  },
  existingAndProposedElevations: {
    title: "Elevations support",
    description:
      "Agent Z can interpret when elevation drawings are likely to be needed.",
    questionHelp:
      "Elevations help show the visible change to the building, especially when scale, height, windows, or materials matter.",
    customerOptions: ["Yes, open Agent Z support", "No, not right now"],
    agentXResponses: [
      "Explain when existing and proposed elevations are worth requesting next.",
      "Suggest whether the visible changes are significant enough to justify them now.",
      "Recommend how to phrase the request if the customer does not yet have these drawings.",
    ],
    uploadSupportPrompt:
      "Agent can help. No elevations uploaded yet. Would you like Agent Z to help prepare the existing and proposed elevations?",
    insights: [
      "Elevations often matter more when visual change and materials are a key concern.",
      "They are especially useful when the proposal description alone feels too abstract.",
      "This guidance is more valuable when checked alongside material answers and photographs.",
    ],
    triggers: [
      "No elevations are connected yet.",
      "The case needs clearer visual evidence of the proposal.",
      "Agent X wants to confirm whether elevations should be requested next.",
    ],
  },
  photographsOfSite: {
    title: "Site photography support",
    description:
      "Agent Z can identify the most useful photo views to request or review.",
    questionHelp:
      "Site photos are most helpful when they show the front, rear, side context, boundaries, and any area affected by the proposal.",
    customerOptions: ["Yes, open Agent Z support", "No, not right now"],
    agentXResponses: [
      "List the most useful views for the customer to provide.",
      "Explain whether photos can help bridge a gap while drawings are still pending.",
      "Recommend the minimum photo set needed for clearer review.",
    ],
    uploadSupportPrompt:
      "Agent can help. No site photographs uploaded yet. Would you like Agent Z to help define which photos should be collected?",
    insights: [
      "Photos often help validate context faster than text-only descriptions.",
      "Well-chosen views can reduce ambiguity around access, materials, and scale.",
      "Photography is especially useful when drawings are still incomplete.",
    ],
    triggers: [
      "No site photos are connected yet.",
      "The current material or layout answers still feel too abstract.",
      "The team needs help deciding what evidence to ask for first.",
    ],
  },
  additionalDrawings: {
    title: "Additional drawing support",
    description:
      "Agent Z can help decide whether extra floor plans, sections, or supporting drawings are worth requesting.",
    questionHelp:
      "Use this when the standard location plan, site plan, and elevations do not fully explain the proposal or layout.",
    customerOptions: ["Yes, open Agent Z support", "No, not right now"],
    agentXResponses: [
      "Suggest which extra drawing would add the most value next.",
      "Explain whether a floor plan, section, or supporting sketch is the better request.",
      "Recommend a lightweight follow-up rather than over-requesting documents.",
    ],
    uploadSupportPrompt:
      "Agent can help. No additional drawings uploaded yet. Do you want help identifying which extra drawings would strengthen the case?",
    insights: [
      "Additional drawings are most useful when the standard set still leaves layout questions unanswered.",
      "Sections and floor plans can resolve uncertainty faster than extended text descriptions.",
      "The right extra drawing depends on what part of the proposal remains unclear.",
    ],
    triggers: [
      "No additional drawings are connected yet.",
      "The team still has unanswered layout or height questions.",
      "Agent X wants help deciding what extra document would add the most value.",
    ],
  },
  nearConservationAreaOrListedBuilding: {
    title: "Heritage sensitivity",
    description:
      "Agent Z can interpret whether heritage context is likely to change the review route.",
    questionHelp:
      "This question is about whether the property is in a conservation area or close enough to a listed building that design sensitivity may increase.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain why heritage context may increase the need for drawings and materials clarity.",
      "Suggest checking the council map or listing context if the customer is unsure.",
      "Flag the case for a more cautious design review if heritage sensitivity is likely.",
    ],
    insights: [
      "Heritage context can raise the bar for visual detail and supporting evidence.",
      "This answer often matters more when combined with materials and elevation information.",
      "Early clarity here helps avoid weak downstream assumptions.",
    ],
    triggers: [
      "The customer is unsure about conservation or listed-building proximity.",
      "The answer may require tighter review of drawings and materials.",
      "Agent X wants a quick heritage-sensitivity read before moving on.",
    ],
  },
  treesWithinFallingDistance: {
    title: "Tree risk proximity",
    description:
      "Agent Z can assess whether nearby trees are likely to create a more sensitive review path.",
    questionHelp:
      "This is about whether large trees are close enough to the works that falling distance, root protection, or arboricultural review could matter.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain why trees close to the works can trigger extra tree-related review.",
      "Suggest checking approximate distance, species, and height if the answer is uncertain.",
      "Recommend whether a tree report follow-up is likely to help.",
    ],
    insights: [
      "Trees near the works can drive the need for extra arboricultural review.",
      "This answer is more valuable when paired with species and height context.",
      "Clarifying risk proximity early reduces later uncertainty about documents.",
    ],
    triggers: [
      "The customer is unsure about how close the trees are to the works.",
      "The answer influences whether a tree report may be needed.",
      "Agent X needs help deciding whether a follow-up question is necessary.",
    ],
  },
  treeSurveyReport: {
    title: "Tree report support",
    description:
      "Agent Z can explain when a BS5837-style report is likely to help or be expected.",
    questionHelp:
      "A tree report is usually most relevant where protected trees, nearby mature trees, or root protection areas may be affected by the works.",
    customerOptions: ["Yes, open Agent Z support", "No, not right now"],
    agentXResponses: [
      "Explain whether the site answers suggest a tree report is worth considering now.",
      "Clarify what a BS5837 or arboriculture report is typically used for.",
      "Recommend whether the team should request, defer, or simply flag the report.",
    ],
    uploadSupportPrompt:
      "Agent can help. No tree report uploaded yet. Would you like Agent Z to explain whether an Arboriculture / BS5837 report is likely to be needed?",
    insights: [
      "Tree reports become more relevant when TPOs, proximity, or root protection concerns exist.",
      "This document often matters because it converts tree uncertainty into reviewable evidence.",
      "The need for a report is easier to judge after the tree-answer cluster is reviewed together.",
    ],
    triggers: [
      "No tree report is connected yet.",
      "The team wants help deciding whether a report should be requested now.",
      "Tree answers suggest there may be additional landscaping sensitivity.",
    ],
  },
  isSiteInFloodRiskArea: {
    title: "Flood zone check",
    description:
      "Agent Z can help interpret whether the flood answer is likely to raise additional evidence needs.",
    questionHelp:
      "Use this when the customer is unsure whether the site falls within Flood Zone 2 or 3 and what that means for planning evidence.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain that the flood-zone answer is mainly a routing question for later evidence.",
      "Suggest checking flood mapping or council guidance if the customer is unsure.",
      "Recommend whether the FRA upload question should be treated as a likely next step.",
    ],
    insights: [
      "Flood risk answers are often routing questions rather than final decisions.",
      "Sites in higher-risk zones commonly need clearer supporting evidence.",
      "This answer should usually be reviewed with drainage and the FRA question.",
    ],
    triggers: [
      "The flood status is not obvious to the customer.",
      "The answer may affect whether an FRA becomes important.",
      "Agent X wants a quick recommendation before requesting extra work.",
    ],
  },
  isSiteContaminatedLand: {
    title: "Contamination risk check",
    description:
      "Agent Z can help frame whether contamination concerns need a stronger follow-up.",
    questionHelp:
      "This question is about known site-history issues, former uses, or local information that could suggest contamination risk.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain that this is a risk-flagging question rather than a final technical assessment.",
      "Ask whether the customer knows any previous industrial or unusual site history.",
      "Recommend cautious follow-up when the answer is uncertain instead of confidently guessing.",
    ],
    insights: [
      "Contamination answers usually matter most when the customer is uncertain rather than definite.",
      "A cautious answer here can change the level of review needed later.",
      "This is often best treated as a risk-flagging question first.",
    ],
    triggers: [
      "The customer is unsure about site history or prior land use.",
      "The answer changes risk posture for the case.",
      "Agent X wants advice on whether more evidence should be requested.",
    ],
  },
  floodRiskAssessmentReport: {
    title: "Flood Risk Assessment support",
    description:
      "Agent Z can explain when an FRA is likely to matter and what role it plays in review.",
    questionHelp:
      "An FRA is usually considered when flood-zone answers already suggest the site may need more formal flood evidence.",
    customerOptions: ["Yes, open Agent Z support", "No, not right now"],
    agentXResponses: [
      "Explain whether the current flood answers make an FRA likely or just possible.",
      "Clarify whether this should be requested now or held as a later follow-up.",
      "Help draft a simple next-step message to the customer if the report is probably needed.",
    ],
    uploadSupportPrompt:
      "Agent can help. No Flood Risk Assessment uploaded yet. Would you like Agent Z to explain whether the site is likely to need one?",
    insights: [
      "An FRA is usually more relevant when flood-zone answers already look sensitive.",
      "The real question is often whether the case is mature enough to request it now.",
      "This guidance helps decide whether to escalate the request or hold it for later.",
    ],
    triggers: [
      "No FRA is connected yet.",
      "Flood answers suggest the site may need extra evidence.",
      "Agent X wants support before asking for a specialist report.",
    ],
  },
  smokeAlarmsInstalled: {
    title: "Smoke alarm compliance check",
    description:
      "Agent Z can explain why this answer matters in the wider safety and HMO context.",
    questionHelp:
      "This is about whether basic smoke alarm provision is already in place, not a full technical fire strategy.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain that the answer is a quick readiness signal rather than the full compliance outcome.",
      "Suggest that missing alarms may lead to follow-up safety actions later.",
      "Use Agent Z when the customer is unsure what is already installed.",
    ],
    insights: [
      "Safety questions often work best when read as a compliance cluster rather than in isolation.",
      "A missing or uncertain answer here may shape the next documents requested from the customer.",
      "This answer becomes more useful when compared with gas, electrical, and EPC status.",
    ],
    triggers: [
      "The customer is unsure of current safety readiness.",
      "The team wants to interpret the answer in the broader compliance context.",
      "Agent X needs a quick next-step recommendation.",
    ],
  },
  gasSafetyCertificate: {
    title: "Gas safety evidence",
    description:
      "Agent Z can help decide how this certificate affects the next compliance follow-up.",
    questionHelp:
      "This is asking whether a current and valid Gas Safety Certificate exists for the property.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain that a valid certificate strengthens the compliance picture.",
      "Recommend whether the customer should be asked to upload or confirm the certificate next.",
      "Use Agent Z to prioritise the follow-up if several compliance documents are missing.",
    ],
    insights: [
      "Gas safety status is more helpful when reviewed alongside EICR and EPC answers.",
      "A missing certificate may change what documents the team prioritises next.",
      "This answer can guide the tone of the next customer request.",
    ],
    triggers: [
      "The certificate is missing or the customer is not sure whether it is current.",
      "The team wants a compliance-oriented follow-up strategy.",
      "Agent X needs help prioritising missing documents.",
    ],
  },
  electricalReportEicr: {
    title: "Electrical report check",
    description:
      "Agent Z can interpret how EICR status affects the safety-compliance picture.",
    questionHelp:
      "This is asking whether a valid Electrical Installation Condition Report is already available for the property.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain whether the current compliance picture still looks incomplete without the EICR.",
      "Suggest asking for upload, expiry confirmation, or follow-up only if needed.",
      "Use Agent Z when the customer is not sure whether the report is still valid.",
    ],
    insights: [
      "The EICR answer often matters most when it conflicts with other safety answers.",
      "A missing report can shape both customer follow-up and downstream expectations.",
      "This answer is best reviewed as part of a broader compliance bundle.",
    ],
    triggers: [
      "The report is unavailable or uncertain.",
      "The team wants help deciding what to request next.",
      "Agent X needs decision support before proceeding.",
    ],
  },
  epcAvailable: {
    title: "EPC availability check",
    description:
      "Agent Z can explain how EPC status fits into the wider compliance review.",
    questionHelp:
      "This question is simply about whether an EPC is available now, not whether the property already meets every efficiency expectation.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain how EPC availability contributes to the overall completeness of the file.",
      "Recommend whether the EPC should be requested now or later alongside other compliance items.",
      "Use Agent Z when the customer is unsure whether a valid EPC exists already.",
    ],
    insights: [
      "EPC availability may affect how complete the current compliance picture feels.",
      "This answer is usually more useful when reviewed alongside the other safety documents.",
      "A missing EPC may not block everything, but it can change next steps.",
    ],
    triggers: [
      "The EPC is missing or unclear.",
      "The team wants a better sense of overall compliance completeness.",
      "Agent X needs help prioritising customer follow-up.",
    ],
  },
  waterSupply: {
    title: "Water supply guidance",
    description:
      "Agent Z can help interpret the expected answer for how the property is supplied with water.",
    questionHelp:
      "This is usually about whether the site uses a normal mains supply or something more unusual that needs explanation.",
    customerOptions: ["Mains supply", "Private or unusual arrangement", "Ask Agent Z"],
    agentXResponses: [
      "Explain the most likely answer based on a standard residential setup.",
      "Flag unusual supply arrangements that may deserve a follow-up note.",
      "Recommend Agent Z when the customer does not know how the site is serviced.",
    ],
    insights: [
      "Most residential sites have straightforward water answers, but unusual cases should be explained clearly.",
      "This question becomes more important when the use intensity of the property is changing.",
      "Agent Z helps avoid overcomplicating a usually simple utilities answer.",
    ],
    triggers: [
      "The customer does not know whether the site has a standard supply arrangement.",
      "The property setup appears more complex than a normal dwelling.",
      "Agent X wants a short, practical answer recommendation.",
    ],
  },
  sewageOrDrainage: {
    title: "Sewage and drainage guidance",
    description:
      "Agent Z can help explain what answer best fits the property's sewage or foul drainage arrangement.",
    questionHelp:
      "This usually means whether the site connects to a normal mains system or relies on a private arrangement that should be identified.",
    customerOptions: ["Mains drainage", "Private drainage arrangement", "Ask Agent Z"],
    agentXResponses: [
      "Explain the likely answer for a typical urban residential site.",
      "Flag when a private or unusual setup deserves a clearer note.",
      "Use Agent Z when the customer is unsure whether the property is on mains drainage.",
    ],
    insights: [
      "Drainage answers are often simple, but a private system can materially change the discussion.",
      "This answer is stronger when reviewed with broader site-constraints information.",
      "Agent Z helps keep the wording clear without sounding overly technical.",
    ],
    triggers: [
      "The customer is unsure about the drainage arrangement.",
      "The site looks rural, unusual, or newly altered.",
      "Agent X needs a cautious answer recommendation.",
    ],
  },
  surfaceWaterDrainage: {
    title: "Surface water drainage guidance",
    description:
      "Agent Z can help interpret how rainwater or surface runoff is likely handled at the site.",
    questionHelp:
      "This question usually relates to how surface water is drained, especially if new hardstanding, roof changes, or altered access are proposed.",
    customerOptions: ["Standard drainage arrangement", "Sustainable / site-specific arrangement", "Ask Agent Z"],
    agentXResponses: [
      "Explain the likely answer based on whether the proposal changes hard surfaces or roof area.",
      "Suggest a cautious follow-up if the customer is unsure how runoff is currently handled.",
      "Recommend Agent Z when drainage implications are unclear from the saved answers.",
    ],
    insights: [
      "Surface water becomes more relevant when the proposal changes roofs, paving, or site layout.",
      "This answer often sits between utilities and site-constraints review.",
      "A practical explanation is usually more useful than highly technical wording here.",
    ],
    triggers: [
      "The proposal may affect runoff or paved areas.",
      "The customer does not know the current drainage arrangement.",
      "Agent X wants help deciding whether to ask for more detail.",
    ],
  },
  existingWasteArrangements: {
    title: "Waste arrangements guidance",
    description:
      "Agent Z can explain what councils usually expect around waste storage and access.",
    questionHelp:
      "This field usually needs a short description covering where bins are stored and how collection access works.",
    customerOptions: [
      "Describe existing bin storage",
      "Describe collection access",
      "Use Agent Z to draft the wording",
    ],
    agentXResponses: [
      "Draft a simple waste-arrangements description based on the property setup.",
      "Explain what councils usually expect to hear about storage and collection access.",
      "Recommend a follow-up only if the property use is intensifying and the answer stays vague.",
    ],
    insights: [
      "Waste arrangements are often easier to answer when framed around practical collection access.",
      "This field is usually more important when the property use is changing.",
      "A clearer answer here can reduce uncertainty in utilities and amenity review.",
    ],
    triggers: [
      "The customer is unsure what level of waste detail is expected.",
      "The property use pattern suggests waste arrangements matter more.",
      "Agent X wants help shaping a clearer follow-up question.",
    ],
  },
  renewableEnergyProposals: {
    title: "Renewable energy guidance",
    description:
      "Agent Z can assess whether proposed renewable measures need more detail now.",
    questionHelp:
      "This question is mainly about whether any renewable or energy-saving installation forms part of the proposal.",
    customerOptions: ["Yes", "No", "Ask Agent Z"],
    agentXResponses: [
      "Explain whether the proposal sounds like it includes any renewable measure at all.",
      "Flag that visible equipment or structural change may need more detail later.",
      "Use Agent Z when the customer mentions a green measure but not clearly enough to classify it.",
    ],
    insights: [
      "Renewable-energy answers usually matter more when they imply visible or structural changes.",
      "A simple yes or no often is not enough without understanding the measure type.",
      "This is a good place to decide whether more detail is really necessary in the current stage.",
    ],
    triggers: [
      "The customer indicated renewable proposals but the details are still light.",
      "The team wants help deciding whether to request further detail immediately.",
      "Agent X needs a practical next-step recommendation.",
    ],
  },
  certificateOfOwnership: {
    title: "Ownership certificate advice",
    description:
      "Agent Z can help explain which ownership certificate route is most likely to apply.",
    questionHelp:
      "This is about choosing the correct certificate based on whether the applicant owns all the land or needs to notify other owners or tenants.",
    customerOptions: [
      "Certificate A",
      "Certificate B, C, or D",
      "Ask Agent Z / need advice",
    ],
    agentXResponses: [
      "Explain the difference between full ownership and cases involving other owners or tenants.",
      "Suggest when the customer should check title or ownership detail before choosing.",
      "Flag the answer for careful review if the ownership status is still unclear.",
    ],
    insights: [
      "Ownership certificates should align with the earlier ownership-status answer and later declarations.",
      "Choosing the wrong certificate is a submission risk, so caution is better than guessing.",
      "This is a strong advice point for Agent Z because customers often do not know the certificate names.",
    ],
    triggers: [
      "The customer does not know which certificate applies.",
      "Ownership status and later declarations are not yet aligned.",
      "Agent X wants a careful explanation before advising the customer.",
    ],
  },
  additionalConsents: {
    title: "Additional consents guidance",
    description:
      "Agent Z can help explain which extra consent routes may be relevant to the case.",
    questionHelp:
      "Use this when the customer may need something extra such as conservation area consent, tree works consent, or another related permission.",
    customerOptions: [
      "Select a known extra consent",
      "Multiple consents may apply",
      "Ask Agent Z / need advice",
    ],
    agentXResponses: [
      "Shortlist the most likely extra consents from the current site and heritage answers.",
      "Explain why the answer is a flag for follow-up rather than a final legal conclusion.",
      "Suggest the safest next check before telling the customer a consent definitely applies.",
    ],
    insights: [
      "Additional consents often act as early flags rather than final conclusions.",
      "This answer is most useful when paired with site, heritage, and tree context.",
      "A clearer shortlist of likely consents helps avoid vague follow-up requests.",
    ],
    triggers: [
      "The customer needs help understanding which extra consent might apply.",
      "The current answers suggest multiple potential consent paths.",
      "Agent X wants a cleaner advisory summary before following up.",
    ],
  },
}

export default function EligibilityDetailsCard({
  eligibilityData,
  loading,
  projectId,
  projectServiceName,
}: EligibilityDetailsCardProps) {
  const agentZPanelRef = useRef<HTMLDivElement | null>(null)
  const [showEmptyFields, setShowEmptyFields] = useState(true)
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    "step-1": true,
  })
  const [agentZSelection, setAgentZSelection] = useState<AgentZKey | "general">(
    "general"
  )

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
        Loading eligibility details...
      </div>
    )
  }

  if (!eligibilityData) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
        No eligibility details were found for this project.
      </div>
    )
  }

  const applicantName = getEligibilityApplicantName(eligibilityData) ?? "-"
  const siteAddress = getEligibilitySiteAddress(eligibilityData) ?? "-"
  const serviceName = getServiceNameValue(eligibilityData, projectServiceName)
  const councilName = formatEligibilityFieldValue(eligibilityData, "council")
  const subscriptionDetails = getSubscriptionDetailsValue(eligibilityData)
  const completionLabel = `${eligibilityData.completionStatus.percentage}%`
  const completionHint = formatEligibilityStatus(eligibilityData.status)

  const stepSummaries = ACCORDION_STEPS.map((step) => {
    const sections = step.sections.map((section) => {
      const allRows = section.questions.map((question) =>
        buildDetailedQuestionRow(eligibilityData, question)
      )

      return {
        ...section,
        rows: allRows.filter((row) => showEmptyFields || row.answered),
        answeredCount: allRows.filter((row) => row.answered).length,
        incompleteCount: allRows.filter((row) => !row.answered).length,
        totalCount: allRows.length,
        guidanceCount: allRows.filter((row) => Boolean(row.agentZKey)).length,
      }
    })

    return {
      ...step,
      sections,
      answeredCount: sections.reduce((sum, section) => sum + section.answeredCount, 0),
      incompleteCount: sections.reduce((sum, section) => sum + section.incompleteCount, 0),
      totalCount: sections.reduce((sum, section) => sum + section.totalCount, 0),
      visibleCount: sections.reduce((sum, section) => sum + section.rows.length, 0),
      guidanceCount: sections.reduce((sum, section) => sum + section.guidanceCount, 0),
    }
  })

  const activeAgentZConfig =
    agentZSelection !== "general" ? AGENT_Z_PLAYBOOK[agentZSelection] ?? null : null
  const activeAgentZQuestion = findAgentZQuestion(agentZSelection)
  const activeAgentZRow =
    agentZSelection !== "general" && activeAgentZQuestion
      ? buildDetailedQuestionRow(eligibilityData, activeAgentZQuestion)
      : null
  const askAgentZCount = ACCORDION_STEPS.flatMap((step) =>
    step.sections.flatMap((section) =>
      section.questions.filter(
        (question) => Boolean(question.agentZ) && (question.kind ?? "default") !== "resource"
      )
    )
  ).length
  const uploadHelpCount = ACCORDION_STEPS.flatMap((step) =>
    step.sections.flatMap((section) =>
      section.questions.filter(
        (question) => Boolean(question.agentZ) && (question.kind ?? "default") === "resource"
      )
    )
  ).length
  const totalAnsweredRows = stepSummaries.reduce((sum, step) => sum + step.answeredCount, 0)
  const totalVisibleRows = stepSummaries.reduce((sum, step) => sum + step.visibleCount, 0)
  const totalRows = stepSummaries.reduce((sum, step) => sum + step.totalCount, 0)
  const totalIncompleteRows = totalRows - totalAnsweredRows
  const incompletePercent = getIncompletePercent(totalIncompleteRows, totalRows)

  const focusStep = (stepId: string) => {
    setExpandedSteps(
      Object.fromEntries(ACCORDION_STEPS.map((step) => [step.id, step.id === stepId]))
    )
  }

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !(prev[stepId] ?? false),
    }))
  }

  const openAgentZWorkspace = (selection: AgentZKey | "general") => {
    setAgentZSelection(selection)
    window.requestAnimationFrame(() => {
      agentZPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)]">
        <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_48%,#eef2ff_100%)] px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">
                Eligibility Workspace
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Review the customer&apos;s answers with Agent Z planning intelligence
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                All five steps now follow the question numbering from the customer frontend,
                while Agent Z stays visible on the right to explain each guided question,
                customer choice, and the safest Agent X response.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Completion Snapshot
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-3xl font-semibold text-slate-950">{completionLabel}</p>
                <p className="pb-1 text-xs font-medium text-slate-500">{completionHint}</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {eligibilityData.completionStatus.completedSteps} of{" "}
                {eligibilityData.completionStatus.totalSteps} steps completed
              </p>
              <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-600">
                  Incomplete Questions
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-500" />
                  <p className="text-sm font-semibold text-rose-900">
                    {totalIncompleteRows} pending ({incompletePercent}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <SummaryItem label="Applicant" value={applicantName} />
            <SummaryItem label="Site Address" value={siteAddress} />
            <SummaryItem label="Service Name" value="Mandatory HMO License" />
            <SummaryItem label="Council" value={councilName} />
            <SummaryItem label="Subscription Plan" value={subscriptionDetails} />
            <SummaryItem
              label="Agent Z Coverage"
              value={`${askAgentZCount} Ask Agent Z + ${uploadHelpCount} upload help`}
              hint="Mapped to the button pattern from the customer form"
            />
            <button
              type="button"
              onClick={() => openAgentZWorkspace("general")}
              className={`rounded-2xl border px-3.5 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                agentZSelection === "general"
                  ? "border-blue-200 bg-blue-50"
                  : "border-white/90 bg-white/90 hover:border-blue-100"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                Agent Z Insights & Triggers
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Open Agent Z preview
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Review overall project insights plus compliance, documentation, and
                subscription triggers.
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_380px]">
        <div className="space-y-4">
          <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Review Flow
                </p>
                <h4 className="mt-2 text-lg font-semibold text-slate-950">
                  Five customer steps with numbered questions
                </h4>
                <p className="mt-1 text-sm text-slate-600">
                  Open any step to review the live answers. Use Agent Z where the form shows
                  guidance buttons, unsure paths, or upload-help prompts.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Rows shown
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {totalVisibleRows}/{totalRows}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Guidance
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {askAgentZCount + uploadHelpCount} prompts
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-600">
                    Incomplete
                  </p>
                  <p className="mt-1 text-sm font-semibold text-rose-900">
                    {totalIncompleteRows}/{totalRows} ({incompletePercent}%)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Project {projectId ?? eligibilityData.projectId}
                  </span>
                  <button
                    type="button"
                    onClick={() => openAgentZWorkspace("general")}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                  >
                    Focus Agent Z
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmptyFields((prev) => !prev)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {showEmptyFields ? "Hide empty fields" : "Show empty fields"}
                  </button>
                </div>
              </div>
            </div>

              <div className="mt-5 grid gap-2 lg:grid-cols-2 xl:grid-cols-5">
                {stepSummaries.map((step) => {
                const completionStep = eligibilityData.completionStatus.steps.find(
                  (entry) => entry.step === step.number
                )
                const statusLabel = getStepStatusLabel(
                  eligibilityData.currentStep,
                  step.number,
                  Boolean(completionStep?.completed)
                )
                const completionPercent = getCompletionPercent(step.answeredCount, step.totalCount)

                return (
                  <button
                    key={`nav-${step.id}`}
                    type="button"
                    onClick={() => focusStep(step.id)}
                    className={`rounded-[24px] border px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                      expandedSteps[step.id]
                        ? "border-blue-200 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Step {step.number}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">
                          {step.title}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          expandedSteps[step.id]
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        {completionPercent}%
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/80">
                      <div
                        className={`h-full rounded-full transition-all ${
                          expandedSteps[step.id] ? "bg-blue-600" : "bg-slate-400"
                        }`}
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                      <span>{step.answeredCount}/{step.totalCount} answered</span>
                      <span className={step.incompleteCount > 0 ? "font-semibold text-rose-700" : ""}>
                        {step.incompleteCount} incomplete
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-blue-700">{statusLabel}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            {stepSummaries.map((step) => {
              const completionStep = eligibilityData.completionStatus.steps.find(
                (entry) => entry.step === step.number
              )
              const expanded = expandedSteps[step.id] ?? false
              const statusLabel = getStepStatusLabel(
                eligibilityData.currentStep,
                step.number,
                Boolean(completionStep?.completed)
              )
              const toneClasses = getToneClasses(step.tone)
              const completionPercent = getCompletionPercent(step.answeredCount, step.totalCount)

              return (
                <div
                  key={step.id}
                  className={`overflow-hidden rounded-[26px] border shadow-[0_14px_36px_-34px_rgba(15,23,42,0.45)] ${toneClasses.card}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5"
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses.step}`}
                        >
                          Step {step.number}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses.status}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="mt-3 flex items-start gap-3">
                        <span className="mt-0.5 text-slate-700">{getToneIcon(step.tone)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-slate-900">
                              {step.title}
                            </h4>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClasses.badge}`}
                            >
                              {completionPercent}% complete
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {step.answeredCount}/{step.totalCount} questions answered across{" "}
                            {step.sections.length} sections with {step.incompleteCount} incomplete
                          </p>
                          <div className="mt-3 h-1.5 rounded-full bg-white/80">
                            <div
                              className={`h-full rounded-full transition-all ${toneClasses.progress}`}
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClasses.badge}`}
                      >
                        {step.answeredCount}/{step.totalCount}
                      </span>
                      <span className="rounded-full border border-white/90 bg-white/90 p-1 text-slate-500">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </button>

                  {expanded ? (
                    <div className="border-t border-white/80 bg-white/72 px-4 py-4 sm:px-5">
                      <div className="flex flex-wrap gap-2">
                        {step.sections.map((section) =>
                          section.totalCount > 0 ? (
                            <span
                              key={`${step.id}-${section.title}-summary`}
                              className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-600"
                            >
                              {section.title}: {section.answeredCount}/{section.totalCount}
                            </span>
                          ) : null
                        )}
                      </div>
                      <div className="mt-4 grid gap-3 xl:grid-cols-2">
                        {step.sections.map((section) => {
                          if (section.rows.length === 0) {
                            return null
                          }

                          return (
                            <div
                              key={section.title}
                              className="rounded-[22px] border border-slate-200/80 bg-white/92 p-3.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    {section.title}
                                  </span>
                                  {section.guidanceCount > 0 ? (
                                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                                      {section.guidanceCount} guided
                                    </span>
                                  ) : null}
                                  {section.incompleteCount > 0 ? (
                                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700">
                                      {section.incompleteCount} incomplete
                                    </span>
                                  ) : null}
                                </div>
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                  {section.answeredCount}/{section.totalCount}
                                </span>
                              </div>
                              <div className="mt-3 space-y-2.5">
                                {section.rows.map((row) => (
                                  <QuestionRow
                                    key={`${section.title}-${row.number}`}
                                    row={row}
                                    active={row.agentZKey === agentZSelection}
                                    onOpenAgentZ={(key) => openAgentZWorkspace(key)}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <AgentZWorkspacePanel
          panelRef={agentZPanelRef}
          projectId={projectId ?? eligibilityData.projectId}
          serviceName={serviceName}
          customerName={applicantName}
          councilName={councilName}
          subscriptionDetails={subscriptionDetails}
          completionLabel={completionLabel}
          completionHint={completionHint}
          askAgentZCount={askAgentZCount}
          uploadHelpCount={uploadHelpCount}
          totalAnsweredRows={totalAnsweredRows}
          totalRows={totalRows}
          question={activeAgentZQuestion}
          row={activeAgentZRow}
          playbookEntry={activeAgentZConfig}
          active={agentZSelection !== "general"}
          onReset={() => setAgentZSelection("general")}
        />
      </div>
    </div>
  )
}

function getToneIcon(tone: Tone) {
  switch (tone) {
    case "blue":
      return <Home size={16} className="text-blue-600" />
    case "indigo":
      return <Ruler size={16} className="text-indigo-600" />
    case "amber":
      return <Shield size={16} className="text-amber-600" />
    case "emerald":
      return <Droplets size={16} className="text-emerald-600" />
  }
}

function getToneClasses(tone: Tone) {
  switch (tone) {
    case "blue":
      return {
        card: "border-blue-100 bg-gradient-to-br from-blue-50/90 via-white to-slate-50",
        step: "bg-blue-100 text-blue-700",
        badge: "border-blue-200 bg-blue-100 text-blue-700",
        status: "bg-white text-blue-700 ring-1 ring-blue-200",
        progress: "bg-blue-600",
      }
    case "indigo":
      return {
        card: "border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50",
        step: "bg-indigo-100 text-indigo-700",
        badge: "border-indigo-200 bg-indigo-100 text-indigo-700",
        status: "bg-white text-indigo-700 ring-1 ring-indigo-200",
        progress: "bg-indigo-600",
      }
    case "amber":
      return {
        card: "border-amber-100 bg-gradient-to-br from-amber-50/90 via-white to-slate-50",
        step: "bg-amber-100 text-amber-700",
        badge: "border-amber-200 bg-amber-100 text-amber-700",
        status: "bg-white text-amber-700 ring-1 ring-amber-200",
        progress: "bg-amber-600",
      }
    case "emerald":
      return {
        card: "border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-slate-50",
        step: "bg-emerald-100 text-emerald-700",
        badge: "border-emerald-200 bg-emerald-100 text-emerald-700",
        status: "bg-white text-emerald-700 ring-1 ring-emerald-200",
        progress: "bg-emerald-600",
      }
  }
}

function getStepStatusLabel(currentStep: number, stepNumber: number, completed: boolean) {
  if (completed) return "Completed"
  if (currentStep === stepNumber) return "Current"
  return stepNumber < currentStep ? "Reviewed" : "Pending"
}

function getCompletionPercent(answeredCount: number, totalCount: number) {
  if (totalCount === 0) return 0
  return Math.round((answeredCount / totalCount) * 100)
}

function getIncompletePercent(incompleteCount: number, totalCount: number) {
  if (totalCount === 0) return 0
  return Math.round((incompleteCount / totalCount) * 100)
}

function formatDisplayValue(value?: unknown): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") return String(value)

  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : "-"
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => formatDisplayValue(item))
      .filter((item) => item !== "-")
    return items.length > 0 ? items.join(", ") : "-"
  }

  if (typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>)
      .map((item) => formatDisplayValue(item))
      .filter((item) => item !== "-")
    return values.length > 0 ? values.join(", ") : "-"
  }

  return String(value)
}

function formatDateValue(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatEligibilityStatus(status?: string | null) {
  if (!status) return "Eligibility"

  return status
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatEligibilityFieldValue(
  eligibility: EligibilityData,
  fieldKey: EligibilityFieldKey
) {
  const mapping = eligibilityFieldMappings[fieldKey]
  const value = getEligibilityFieldValue(eligibility, fieldKey)

  if (mapping.format === "date") {
    return typeof value === "string" ? formatDateValue(value) : "-"
  }

  return formatDisplayValue(value)
}

function getPhoneDisplayValue(eligibility: EligibilityData) {
  const countryCode = formatEligibilityFieldValue(eligibility, "countryCode")
  const phoneNumber = formatEligibilityFieldValue(eligibility, "phoneNumber")

  if (countryCode === "-" && phoneNumber === "-") return "-"
  if (countryCode === "-") return phoneNumber
  if (phoneNumber === "-") return countryCode
  return `${countryCode} ${phoneNumber}`
}

function getServiceNameValue(eligibility: EligibilityData, fallback?: string) {
  const formattedFallback = fallback?.trim() ? fallback.trim() : "-"
  if (formattedFallback !== "-") {
    return formattedFallback
  }

  const purposeOfDevelopment = formatEligibilityFieldValue(eligibility, "purposeOfDevelopment")
  return purposeOfDevelopment
}

function getSubscriptionDetailsValue(eligibility: EligibilityData) {
  const candidatePaths = [
    ["subscriptionDetails"],
    ["subscription", "details"],
    ["subscription", "plan"],
    ["subscription", "name"],
    ["customer", "subscriptionDetails"],
    ["customer", "subscription", "plan"],
    ["project", "subscriptionDetails"],
    ["project", "subscription", "plan"],
  ] as const

  for (const path of candidatePaths) {
    const formatted = formatDisplayValue(getNestedValue(eligibility, path))
    if (formatted !== "-") {
      return formatted
    }
  }

  return "Bronze Plan"
}

function formatPairedDimensionValue(first: string, second: string) {
  if (first === "-" && second === "-") return "-"
  if (first === "-") return `Width ${second}`
  if (second === "-") return `Length ${first}`
  return `Length ${first} • Width ${second}`
}

function isAnsweredValue(value: string) {
  return value !== "-"
}

function buildDetailedQuestionRow(
  eligibility: EligibilityData,
  question: DetailedQuestion
): BuiltQuestionRow {
  const kind = question.kind ?? "default"

  if (kind === "resource") {
    const raw = question.resourceKey
      ? getEligibilityResourceValue(eligibility, question.resourceKey)
      : undefined
    const resourceLinks = extractResourceLinks(question.label, raw)
    const value = summarizeResourceValue(raw, resourceLinks)

    return {
      number: question.number,
      label: question.label,
      kind,
      value,
      answered: resourceLinks.length > 0 || isAnsweredValue(value),
      helperText: question.helperText,
      emptyPrompt: question.emptyPrompt,
      resourceLinks,
      bundleItems: [],
      agentZKey: question.agentZ ?? null,
      agentZLabel: question.agentZLabel,
      agentZSelected: false,
    }
  }

  if (kind === "bundle") {
    const bundleItems = (question.bundleItems ?? []).map((item) => {
      const value = item.getValue
        ? item.getValue(eligibility)
        : item.fieldKey
        ? formatEligibilityFieldValue(eligibility, item.fieldKey)
        : item.resourceKey
        ? summarizeResourceValue(
            getEligibilityResourceValue(eligibility, item.resourceKey),
            extractResourceLinks(item.label, getEligibilityResourceValue(eligibility, item.resourceKey))
          )
        : "-"
      const links = item.resourceKey
        ? extractResourceLinks(item.label, getEligibilityResourceValue(eligibility, item.resourceKey))
        : []

      return {
        label: item.label,
        value,
        links,
        answered: links.length > 0 || isAnsweredValue(value),
      }
    })

    const answeredCount = bundleItems.filter((item) => item.answered).length

    return {
      number: question.number,
      label: question.label,
      kind,
      value: answeredCount > 0 ? `${answeredCount}/${bundleItems.length} items connected` : "-",
      answered: answeredCount > 0,
      helperText: question.helperText,
      emptyPrompt: question.emptyPrompt,
      resourceLinks: [],
      bundleItems,
      agentZKey: question.agentZ ?? null,
      agentZLabel: question.agentZLabel,
      agentZSelected: false,
    }
  }

  if (kind === "signature") {
    const value = getDigitalSignatureValue(eligibility)

    return {
      number: question.number,
      label: question.label,
      kind,
      value,
      answered: isAnsweredValue(value),
      helperText: question.helperText,
      emptyPrompt:
        "Signature capture data is not connected in this workspace payload yet.",
      resourceLinks: [],
      bundleItems: [],
      agentZKey: null,
      agentZLabel: undefined,
      agentZSelected: false,
    }
  }

  const value = question.getValue
    ? question.getValue(eligibility)
    : question.fieldKey
    ? formatEligibilityFieldValue(eligibility, question.fieldKey)
    : "-"

  return {
    number: question.number,
    label: question.label,
    kind,
    value,
    answered: isAnsweredValue(value),
    helperText: question.helperText,
    emptyPrompt: question.emptyPrompt,
    resourceLinks: [],
    bundleItems: [],
    agentZKey: question.agentZ ?? null,
    agentZLabel: question.agentZLabel,
    agentZSelected: question.agentZ ? hasAgentZSelection(value) : false,
  }
}

function hasAgentZSelection(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized === "-") return false

  return [
    "agent z",
    "ask agent z",
    "unsure",
    "don't know",
    "dont know",
    "not decided",
    "need advice",
    "planning to create one",
  ].some((term) => normalized.includes(term))
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function extractResourceLinks(label: string, raw: unknown): ResourceLink[] {
  if (!raw) return []

  if (typeof raw === "string") {
    return isUrl(raw) ? [{ label, href: raw }] : []
  }

  if (Array.isArray(raw)) {
    return raw.flatMap((item, index) =>
      extractResourceLinks(raw.length > 1 ? `${label} ${index + 1}` : label, item)
    )
  }

  if (typeof raw === "object") {
    const record = raw as Record<string, unknown>
    const hrefCandidate = ["url", "href", "downloadUrl", "link", "fileUrl", "signedUrl"]
      .map((key) => record[key])
      .find((value): value is string => typeof value === "string" && isUrl(value))

    const nameCandidate = ["name", "label", "title", "filename"]
      .map((key) => record[key])
      .find((value): value is string => typeof value === "string" && value.trim().length > 0)

    if (hrefCandidate) {
      return [{ label: nameCandidate ?? label, href: hrefCandidate }]
    }

    return Object.entries(record).flatMap(([key, value]) =>
      extractResourceLinks(`${label} ${key}`, value)
    )
  }

  return []
}

function summarizeResourceValue(raw: unknown, links: ResourceLink[]) {
  if (links.length > 0) {
    return `${links.length} file${links.length === 1 ? "" : "s"} connected`
  }

  const formatted = formatDisplayValue(raw)
  return formatted === "-" ? "-" : formatted
}

function getNestedValue(data: unknown, path: readonly string[]) {
  let current = data

  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

function getDigitalSignatureValue(eligibility: EligibilityData) {
  const candidatePaths = [
    ["Declarations", "DigitalSignature", "signature"],
    ["Declarations", "DigitalSignature", "signatureData"],
    ["Declarations", "DigitalSignature", "signatureImage"],
    ["Declarations", "digitalSignature", "signature"],
    ["Declarations", "digitalSignature", "signatureData"],
    ["Declarations", "digitalSignature", "signatureImage"],
    ["declarations", "DigitalSignature", "signature"],
    ["declarations", "DigitalSignature", "signatureData"],
    ["declarations", "DigitalSignature", "signatureImage"],
    ["declarations", "digitalSignature", "signature"],
    ["declarations", "digitalSignature", "signatureData"],
    ["declarations", "digitalSignature", "signatureImage"],
  ] as const

  for (const path of candidatePaths) {
    const value = getNestedValue(eligibility, path)
    const formatted = formatDisplayValue(value)
    if (formatted !== "-") {
      return "Signature captured"
    }
  }

  return "-"
}

function findAgentZQuestion(selection: AgentZKey | "general") {
  if (selection === "general") return null

  return (
    ACCORDION_STEPS.flatMap((step) =>
      step.sections.flatMap((section) => section.questions)
    ).find((question) => question.agentZ === selection) ?? null
  )
}

function getAgentZQuestionHelp(
  question: DetailedQuestion | null | undefined,
  playbookEntry: AgentZPlaybookEntry | null
) {
  return (
    playbookEntry?.questionHelp ??
    question?.helperText ??
    playbookEntry?.description ??
    "Select a guided question to see how Agent Z would interpret it."
  )
}

function getAgentZCustomerOptions(
  question: DetailedQuestion | null | undefined,
  playbookEntry: AgentZPlaybookEntry | null
) {
  if (playbookEntry?.customerOptions?.length) {
    return playbookEntry.customerOptions
  }

  if (!question) return ["Select a guided question from the left workspace"]

  if ((question.kind ?? "default") === "resource") {
    return ["Yes, open Agent Z support", "No, not right now"]
  }

  if ((question.kind ?? "default") === "block") {
    return ["Provide a short written answer", "Use Agent Z to refine the wording"]
  }

  return ["Yes", "No", "Ask Agent Z"]
}

function getAgentXResponseIdeas(
  question: DetailedQuestion | null | undefined,
  playbookEntry: AgentZPlaybookEntry | null
) {
  if (playbookEntry?.agentXResponses?.length) {
    return playbookEntry.agentXResponses
  }

  if (!question) {
    return [
      "Open any guided question to see tailored Agent Z support.",
      "Use the right-side panel to compare the saved answer and likely next action together.",
    ]
  }

  if ((question.kind ?? "default") === "resource") {
    return [
      "Explain whether the document is likely needed now or later.",
      "Recommend the clearest next request back to the customer.",
    ]
  }

  return [
    "Explain what this question is trying to confirm.",
    "Recommend the safest next answer or follow-up based on the saved data.",
  ]
}

function getAgentZSupportPrompt(
  row: BuiltQuestionRow,
  playbookEntry: AgentZPlaybookEntry | null
) {
  return (
    playbookEntry?.uploadSupportPrompt ??
    row.emptyPrompt ??
    "Agent can help. Open Agent Z to review what this question means and what should happen next."
  )
}

function getAnswerTone(value: string) {
  const normalized = value.trim().toLowerCase()

  if (normalized === "yes") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (normalized === "no") {
    return "bg-rose-100 text-rose-700"
  }

  if (normalized.includes("don't know") || normalized.includes("dont know")) {
    return "bg-amber-100 text-amber-700"
  }

  if (normalized.includes("not required")) {
    return "bg-slate-100 text-slate-700"
  }

  return "bg-blue-100 text-blue-700"
}

function SummaryItem({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-white/90 bg-white/90 px-3.5 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function QuestionRow({
  row,
  active,
  onOpenAgentZ,
}: {
  row: BuiltQuestionRow
  active: boolean
  onOpenAgentZ: (fieldKey: AgentZKey | "general") => void
}) {
  const isBooleanValue = row.value === "Yes" || row.value === "No"
  const isIncomplete = !row.answered
  const playbookEntry = row.agentZKey ? AGENT_Z_PLAYBOOK[row.agentZKey] ?? null : null
  const showUploadAgentHelp = row.kind === "resource" && !row.answered && Boolean(row.agentZKey)
  const containerClasses = active
    ? "border-blue-200 bg-blue-50/70 shadow-[0_12px_30px_-28px_rgba(37,99,235,0.75)]"
    : isIncomplete
    ? "border-rose-200 bg-rose-50/70"
    : "border-slate-200 bg-slate-50/70"
  const questionBadgeClasses = active
    ? "bg-blue-600 text-white ring-blue-600"
    : isIncomplete
    ? "bg-rose-100 text-rose-700 ring-rose-200"
    : "bg-white text-slate-600 ring-slate-200"
  const panelClasses = isIncomplete
    ? "rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-2.5"
    : "rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5"
  const promptClasses = isIncomplete
    ? "rounded-xl border border-dashed border-rose-200 bg-rose-50/80 px-3 py-2.5 text-sm text-rose-800"
    : "rounded-xl border border-dashed border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-500"

  return (
    <div
      className={`rounded-xl border px-3 py-3 transition ${containerClasses}`}
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${questionBadgeClasses}`}
            >
              Q{row.number}
            </span>
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-900">
              {row.label}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                row.answered
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {!row.answered ? <AlertTriangle size={12} /> : null}
              {row.answered ? "Answered" : "Missing"}
            </span>
          </div>
          {row.helperText ? (
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{row.helperText}</p>
          ) : null}
          {isIncomplete ? (
            <p className="mt-1.5 text-xs font-semibold text-rose-700">
              Red flag: this field is still incomplete.
            </p>
          ) : null}
        </div>

        {row.agentZKey && !showUploadAgentHelp ? (
          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => onOpenAgentZ(row.agentZKey!)}
              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                active || row.agentZSelected
                  ? "bg-gradient-to-r from-slate-700 via-indigo-600 to-blue-500 text-white shadow-[0_10px_24px_-16px_rgba(37,99,235,0.9)] ring-2 ring-cyan-200/70"
                  : "bg-gradient-to-r from-slate-700 via-indigo-600 to-blue-500 text-white shadow-[0_10px_24px_-16px_rgba(37,99,235,0.9)] hover:brightness-105"
              }`}
            >
              <Bot size={14} />
              {row.agentZLabel ?? (row.agentZSelected ? "Agent Z selected" : "Open Agent Z")}
            </button>
            {active ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                In Agent Z
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {row.kind === "block" ? (
        <div className={`mt-3 ${panelClasses}`}>
          <p className={`whitespace-pre-wrap break-words text-sm leading-6 ${isIncomplete ? "text-rose-900" : "text-slate-700"}`}>
            {row.answered ? row.value : "Answer missing"}
          </p>
        </div>
      ) : null}

      {row.kind === "default" ? (
        <div className="mt-3">
          {isBooleanValue ? (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAnswerTone(row.value)}`}
            >
              {row.value}
            </span>
          ) : (
            <div className={panelClasses}>
              <p className={`whitespace-pre-wrap break-words text-sm ${isIncomplete ? "text-rose-900" : "text-slate-700"}`}>
                {row.answered ? row.value : "Answer missing"}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {row.kind === "resource" ? (
        <div className="mt-3 space-y-2.5">
          <div className={panelClasses}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isIncomplete ? "text-rose-600" : "text-slate-500"}`}>
              Document Status
            </p>
            <p className={`mt-1.5 text-sm font-medium ${isIncomplete ? "text-rose-900" : "text-slate-800"}`}>
              {row.answered ? row.value : "No file connected yet"}
            </p>
          </div>

          {row.resourceLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {row.resourceLinks.map((link, index) => (
                <a
                  key={`${row.number}-${link.href}-${index}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <ExternalLink size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          ) : showUploadAgentHelp ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                Agent can help
              </p>
              <p className="mt-1.5 text-sm leading-6 text-amber-950">
                {getAgentZSupportPrompt(row, playbookEntry)}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAgentZ(row.agentZKey!)}
                  className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAgentZ("general")}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className={promptClasses}>
              {row.emptyPrompt ?? "No document connected yet."}
            </div>
          )}
        </div>
      ) : null}

      {row.kind === "bundle" ? (
        <div className="mt-3 space-y-2.5">
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {row.bundleItems.map((item) => (
              <div
                key={`${row.number}-${item.label}`}
                className={`rounded-xl border px-3 py-2.5 ${
                  item.answered
                    ? "border-slate-200 bg-white/90"
                    : "border-rose-200 bg-rose-50/90"
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    item.answered ? "text-slate-500" : "text-rose-600"
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`mt-1.5 text-sm font-medium ${
                    item.answered ? "text-slate-800" : "text-rose-900"
                  }`}
                >
                  {item.answered ? item.value : "Not connected yet"}
                </p>
                {item.links.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.links.map((link, index) => (
                      <a
                        key={`${item.label}-${index}`}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <ExternalLink size={12} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {!row.answered ? (
            <div className={promptClasses}>
              {row.emptyPrompt ?? "No connected bundle items yet."}
            </div>
          ) : null}
        </div>
      ) : null}

      {row.kind === "declaration" ? (
        <div className={`mt-3 flex items-start gap-3 ${panelClasses}`}>
          <div
            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
              row.value === "Yes"
                ? "border-emerald-500 bg-emerald-500 text-white"
                : row.value === "No"
                ? "border-rose-300 bg-rose-50 text-rose-500"
                : "border-rose-300 bg-white text-rose-300"
            }`}
          >
            {row.value === "Yes" ? <Check size={14} /> : null}
          </div>
          <div className="min-w-0">
            <p className={`text-sm leading-6 ${isIncomplete ? "text-rose-900" : "text-slate-700"}`}>{row.label}</p>
            <p className={`mt-1.5 text-xs font-semibold ${isIncomplete ? "text-rose-700" : "text-slate-500"}`}>
              {row.answered ? `Saved answer: ${row.value}` : "Declaration not confirmed yet"}
            </p>
          </div>
        </div>
      ) : null}

      {row.kind === "signature" ? (
        <div className="mt-3 space-y-2.5">
          <div className={isIncomplete ? "rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-3" : "rounded-xl border border-slate-200 bg-white/90 px-3 py-3"}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isIncomplete ? "text-rose-600" : "text-slate-500"}`}>
              Signature Status
            </p>
            <div className={`mt-2.5 min-h-24 rounded-xl border border-dashed px-3 py-3 ${
              isIncomplete
                ? "border-rose-200 bg-rose-50/80"
                : "border-slate-200 bg-slate-50/80"
            }`}>
              <p className={`text-sm ${isIncomplete ? "text-rose-900" : "text-slate-700"}`}>
                {row.answered ? row.value : "Signature capture not available in this workspace yet."}
              </p>
            </div>
          </div>
          {!row.answered && row.emptyPrompt ? (
            <div className={promptClasses}>
              {row.emptyPrompt}
            </div>
          ) : null}
        </div>
      ) : null}

      {!row.answered && row.agentZKey && row.kind !== "resource" ? (
        <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          {playbookEntry?.questionHelp ??
            "Agent can help. Open Agent Z to review guidance for this question before following up."}
        </div>
      ) : null}
    </div>
  )
}

function AgentZWorkspacePanel({
  panelRef,
  projectId,
  serviceName,
  customerName,
  councilName,
  subscriptionDetails,
  completionLabel,
  completionHint,
  askAgentZCount,
  uploadHelpCount,
  totalAnsweredRows,
  totalRows,
  question,
  row,
  playbookEntry,
  active,
  onReset,
}: {
  panelRef: RefObject<HTMLDivElement | null>
  projectId: string
  serviceName: string
  customerName: string
  councilName: string
  subscriptionDetails: string
  completionLabel: string
  completionHint: string
  askAgentZCount: number
  uploadHelpCount: number
  totalAnsweredRows: number
  totalRows: number
  question: DetailedQuestion | null
  row: BuiltQuestionRow | null
  playbookEntry: AgentZPlaybookEntry | null
  active: boolean
  onReset: () => void
}) {
  const insights = playbookEntry?.insights ?? [
    "Agent Z explains what the question is really trying to confirm before the case moves downstream.",
    "It can surface likely next actions, likely documents, and the safest follow-up wording for Agent X.",
    "Keep this panel open while reviewing the left-side steps so the answer and guidance stay visible together.",
  ]

  const triggers = playbookEntry?.triggers ?? [
    "The customer answer is missing, unsure, or incomplete.",
    "The current answer changes what evidence or review route is likely next.",
    "Agent X wants decision support before moving on to the next action.",
  ]
  const questionHelp = getAgentZQuestionHelp(question, playbookEntry)
  const customerOptions = getAgentZCustomerOptions(question, playbookEntry)
  const agentXResponses = getAgentXResponseIdeas(question, playbookEntry)
  const answerValue = row?.value ?? "-"
  const answerLabel =
    answerValue !== "-" ? answerValue : active ? "No saved answer yet" : "No focused answer yet"
  const generalPreview = [
    `Agent Z is ready to review the full ${serviceName} workspace before you focus on an individual question.`,
    `${completionLabel} completion currently sits under ${completionHint.toLowerCase()} status with ${totalAnsweredRows}/${totalRows} eligibility answers captured.`,
    `${askAgentZCount} guided prompts and ${uploadHelpCount} upload-help prompts are already mapped for this project.`,
  ]
  const overallInsights = [
    `${customerName} is being reviewed under ${councilName} with the ${subscriptionDetails} package visible in the workspace.`,
    "The strongest next review path is to keep planning guidance, document follow-ups, and compliance readiness in one place while Agent Z stays open.",
    "Use the focused question mode whenever a saved answer looks uncertain, incomplete, or likely to change the next planning step.",
  ]
  const complianceTriggers = [
    "Open Agent Z when safety, licensing, or planning-readiness answers look partial rather than clearly confirmed.",
    "Use the compliance lens when certificates, alarms, EPC, drainage, or property-readiness answers could change downstream advice.",
    "Escalate into a focused question review whenever the current answer might affect the safest Agent X recommendation.",
  ]
  const documentationTriggers = [
    "Use Agent Z guidance when uploads such as plans, elevations, reports, or site photos are still missing or unclear.",
    "Check documentation triggers first when the workspace shows upload-help prompts and the project cannot move cleanly without evidence.",
    "Stay in preview mode to scan the project-wide documentation picture before drilling into a single missing document question.",
  ]
  const subscriptionTriggers = [
    `${subscriptionDetails} plan should stay visible while reviewing next actions so support expectations are easy to explain.`,
    "Open the preview whenever you want to connect plan context with current planning, compliance, and documentation follow-ups.",
    "Use subscription triggers to keep customer communication aligned with what is currently set up in the workspace.",
  ]

  return (
    <aside ref={panelRef} className="xl:sticky xl:top-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-900/10 bg-slate-950 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.85)]">
        <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/30">
                <Bot size={24} className="text-cyan-200" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white">Agent Z</h4>
                <p className="text-sm text-blue-100/80">Planning Intelligence</p>
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                active
                  ? "bg-cyan-400/15 text-cyan-100 ring-cyan-300/30"
                  : "bg-emerald-400/15 text-emerald-200 ring-emerald-300/20"
              }`}
            >
              {active ? "Focused" : "Preview"}
            </span>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Agent Z Workspace
            </p>
            <h5 className="mt-3 text-xl font-semibold text-white">
              {active && question
                ? `Question ${question.number}: ${question.label}`
                : "Agent Z preview and project triggers"}
            </h5>
            <p className="mt-3 text-sm leading-7 text-slate-200/90">
              {active
                ? playbookEntry?.description ??
                  "Select any guided question from the left to inspect tailored planning intelligence, customer options, and next-step guidance."
                : "This preview keeps overall project insights, compliance checks, documentation prompts, and subscription context together before you drill into a single question."}
            </p>

            {/* <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Project ID
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{projectId}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Service Name
                </p>
                <p className="mt-2 text-sm text-white">{serviceName}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Customer Name
                </p>
                <p className="mt-2 text-sm text-white">{customerName}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Council
                </p>
                <p className="mt-2 text-sm text-white">{councilName}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Subscription Details
                </p>
                <p className="mt-2 text-sm text-white">{subscriptionDetails}</p>
              </div>
            </div> */}

            {active ? (
              <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Current Answer
                </p>
                <p className="mt-2 text-sm text-white">{answerLabel}</p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Agent Z Preview
                </p>
                <div className="mt-3 space-y-2">
                  {generalPreview.map((item) => (
                    <p key={item} className="text-sm leading-7 text-slate-100/90">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {active ? (
              <button
                type="button"
                onClick={onReset}
                className="mt-4 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Back to general workspace
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 bg-slate-950 px-5 py-5">
          {active ? (
            <>
              <div className="rounded-3xl border border-blue-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-blue-100">
                  <Info size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    What This Question Means
                  </p>
                </div>
                <p className="mt-4 rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90">
                  {questionHelp}
                </p>
              </div>

              <div className="rounded-3xl border border-violet-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-violet-100">
                  <Bot size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Customer Options
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  {customerOptions.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <FileCheck size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Agent X Response Ideas
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  {agentXResponses.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">Insights</p>
                </div>
                <div className="mt-4 space-y-3">
                  {insights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-200">
                  <FileCheck size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">Triggers</p>
                </div>
                <div className="mt-4 space-y-3">
                  {triggers.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-3xl border border-emerald-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Overall Project Insights
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {overallInsights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <Shield size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Compliance Triggers
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {complianceTriggers.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-violet-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-violet-100">
                  <FileCheck size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Documentation Triggers
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {documentationTriggers.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Bot size={18} />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Subscription Triggers
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {subscriptionTriggers.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-100/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-4 text-sm text-cyan-100/90">
            <div className="flex items-start gap-3">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p className="leading-7">
                The panel stays visible while you review the left-side steps, so the saved answer,
                form-style options, and Agent X guidance stay together in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
