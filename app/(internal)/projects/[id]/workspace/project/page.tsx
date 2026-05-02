"use client"
import CustomerJourney from "@/components/CustomerJourney"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import axiosInstance from "@/lib/axiosinstance"
import {
  eligibilityFieldMappings,
  getEligibilityApplicantName,
  getEligibilityCorrespondenceAddress,
  getEligibilityFieldValue,
  getEligibilityResourceValue,
  getEligibilitySiteAddress,
  getFirstMappedValue,
} from "@/lib/eligibility"
import { useDocumentMediation } from "../documents/store"
import {
  Phone,
  Mail,
  MapPin,
  FileText,
  Lock,
  CheckCircle,
  Clock,
  Send,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  Ruler,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  StickyNote,
  Eye,
  User,
  Banknote,
  ExternalLink,
  Home,
  Shield,
  TreePine,
  Droplets,
  Info,
  FileCheck,
  Video,
  Bot,
  Headphones,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import {
  defaultWorkspaceRoadmap,
  getWorkspaceRoadmap,
} from "./workspaceData"
import type {
  WorkspaceRoadmapResponse,
  WorkspaceRoadmapStage,
  WorkspaceSectionId as SectionId,
} from "./workspaceData"


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

type EligibilityResponse = {
  success?: boolean
  message?: string
  data?: EligibilityData
}

type EligibilityFieldKey = keyof typeof eligibilityFieldMappings

type EligibilityRow = {
  key: string
  label: string
  value: string
  kind?: "default" | "block"
}

const longEligibilityFieldKeys = new Set<EligibilityFieldKey>([
  "previousProposalDetails",
  "projectComparison",
  "proposedWorksDescription",
  "preApplicationAdviceSummary",
  "ownershipDetails",
  "agentAddress",
])

const defaultExpandedEligibilityGroups: Record<string, boolean> = {
  "applicant-property": true,
  "works-materials": true,
  "site-constraints": true,
}

const submissionApplicantFieldKeys: EligibilityFieldKey[] = [
  "emailAddress",
  "countryCode",
  "phoneNumber",
  "postcode",
]

const submissionPropertyFieldKeys: EligibilityFieldKey[] = [
  "propertyType",
  "ownershipStatus",
  "purposeOfDevelopment",
  "nearConservationAreaOrListedBuilding",
]

const dimensionFieldKeys: EligibilityFieldKey[] = [
  "existingPropertyWidthM",
  "existingPropertyDepthM",
  "proposedExtensionWidthM",
  "proposedExtensionDepthM",
  "distanceFromBoundaryM",
  "ridgeOrEavesHeightM",
]

const materialsFieldKeys: EligibilityFieldKey[] = [
  "proposedWorksDescription",
  "wallMaterials",
  "roofMaterials",
  "materialsMatchExisting",
  "colourOrFinishNotes",
]

const constraintFieldKeys: EligibilityFieldKey[] = [
  "isListedBuilding",
  "isInConservationArea",
  "isSiteInFloodRiskArea",
  "isSiteContaminatedLand",
  "newOrAlteredAccess",
  "accessOrParkingChanges",
  "cycleStorageProvisions",
]

const constraintSupportFieldKeys: EligibilityFieldKey[] = [
  "soughtPreAppAdvice",
  "preApplicationReferenceNumber",
  "treesWithTPO",
  "treeSpecies",
  "treesWithinFallingDistance",
  "additionalConsents",
]

const eligibilityDetailGroups: Array<{
  id: string
  title: string
  tone: "blue" | "indigo" | "amber" | "emerald"
  fieldKeys: EligibilityFieldKey[]
  extraRows?: (eligibility: EligibilityData) => EligibilityRow[]
}> = [
  {
    id: "applicant-property",
    title: "Applicant + Property",
    tone: "blue",
    fieldKeys: [
      "applicantFirstName",
      "applicantMiddleName",
      "applicantLastName",
      "emailAddress",
      "countryCode",
      "phoneNumber",
      "council",
      "propertyType",
      "ownershipStatus",
      "purposeOfDevelopment",
      "nearConservationAreaOrListedBuilding",
      "usesPlanningAgent",
      "agentName",
      "agentContactEmailPhone",
      "agentAddress",
    ],
    extraRows: (eligibility) => [
      {
        key: "siteAddress",
        label: "Site Address",
        value: getEligibilitySiteAddress(eligibility) ?? "-",
        kind: "block",
      },
      {
        key: "postcode",
        label: "Postcode",
        value: formatEligibilityFieldValue(eligibility, "postcode"),
      },
      {
        key: "useAlternateCorrespondenceAddress",
        label: "Alternate address for correspondence?",
        value: formatEligibilityFieldValue(eligibility, "useAlternateCorrespondenceAddress"),
      },
      {
        key: "correspondenceAddress",
        label: "Correspondence Address",
        value: getEligibilityCorrespondenceAddress(eligibility) ?? "-",
        kind: "block",
      },
    ],
  },
  {
    id: "council-history",
    title: "Council / Previous Applications",
    tone: "indigo",
    fieldKeys: [
      "hasPreviousCouncilApplication",
      "previousProposalDetails",
      "planningReferenceNumber",
      "previousApplicationType",
      "previousDevelopmentType",
      "projectComparison",
    ],
  },
  {
    id: "property-occupancy",
    title: "Property + Occupancy",
    tone: "blue",
    fieldKeys: [
      "previouslyExtended",
      "currentUseStatus",
      "currentOccupantsCount",
      "currentHouseholdArrangement",
      "plannedOccupantsCount",
      "sharedKitchenBathroom",
      "roomsRentedIndividually",
      "availableBedroomsCount",
      "bathroomsOrShowerRoomsCount",
      "hasCommunalKitchen",
      "loungeDiningRoomAsBedroom",
      "smallestBedroomSize",
    ],
  },
  {
    id: "works-materials",
    title: "Works + Materials",
    tone: "indigo",
    fieldKeys: [
      "proposedWorksDescription",
      "existingPropertyWidthM",
      "existingPropertyDepthM",
      "proposedExtensionWidthM",
      "proposedExtensionDepthM",
      "ridgeOrEavesHeightM",
      "distanceFromBoundaryM",
      "totalInternalFloorArea",
      "numberOfFloors",
      "propertyFootprint",
      "gardenDepth",
      "plotWidth",
      "kitchenRoomLengthM",
      "kitchenRoomWidthM",
      "bathroomRoomLengthM",
      "bathroomRoomWidthM",
      "wallMaterials",
      "roofMaterials",
      "colourOrFinishNotes",
      "materialsMatchExisting",
    ],
  },
  {
    id: "site-constraints",
    title: "Site Constraints",
    tone: "amber",
    fieldKeys: [
      "isListedBuilding",
      "isInConservationArea",
      "newOrAlteredAccess",
      "accessOrParkingChanges",
      "proposedParkingSpaces",
      "cycleStorageProvisions",
      "treesWithTPO",
      "treesWithinFallingDistance",
      "treeSpecies",
      "approximateTreeSizeM",
      "isSiteInFloodRiskArea",
      "isSiteContaminatedLand",
      "soughtPreAppAdvice",
      "preApplicationReferenceNumber",
      "dateOfPreAppAdvice",
      "officerName",
      "preApplicationAdviceSummary",
    ],
  },
  {
    id: "utilities-consents",
    title: "Utilities + Consents",
    tone: "emerald",
    fieldKeys: [
      "smokeAlarmsInstalled",
      "gasSafetyCertificate",
      "electricalReportEicr",
      "epcAvailable",
      "waterSupply",
      "sewageOrDrainage",
      "surfaceWaterDrainage",
      "existingWasteArrangements",
      "renewableEnergyProposals",
      "renewableEnergyDetails",
      "certificateOfOwnership",
      "ownershipDetails",
      "additionalConsents",
      "communityConsultation",
    ],
  },
  {
    id: "declarations",
    title: "Declarations",
    tone: "blue",
    fieldKeys: [
      "informationAccurate",
      "authorityConfirmed",
      "privateRightsAcknowledged",
      "publicDataConsent",
      "feeAgreementAccepted",
      "signatoryFullName",
      "signedDate",
      "signatoryCapacity",
    ],
  },
]

function getInitialSection(sectionParam: string | null): SectionId {
  if (sectionParam === "communication" || sectionParam === "chat") {
    return "communication"
  }

  if (sectionParam === "documents" || sectionParam === "document") {
    return "documents"
  }

  if (sectionParam === "coordination") {
    return "documents"
  }

  const validSections: SectionId[] = [
    "coordination",
    "project",
    "submission",
    "dimensions",
    "constraints",
    "consultation",
    "requirements",
    "quote",
    "profile",
    "payments",
    "notes",
    "communication",
    "documents",
  ]

  if (sectionParam && validSections.includes(sectionParam as SectionId)) {
    return sectionParam as SectionId
  }

  return "project"
}

function buildStageWorkspaceUrl(projectId: string, stage: WorkspaceRoadmapStage) {
  const params = new URLSearchParams({ section: stage.opensSection })
  if (stage.queryStep) {
    params.set("step", stage.queryStep)
  }
  return `/projects/${projectId}/workspace/project?${params.toString()}`
}

function resolveRoadmapHref(hrefTemplate: string, projectId?: string) {
  if (!projectId) return null
  return hrefTemplate.replace(":projectId", encodeURIComponent(projectId))
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
    const items: string[] = value
      .map((item) => formatDisplayValue(item))
      .filter((item) => item !== "-")
    return items.length > 0 ? items.join(", ") : "-"
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    const preferredKeys = [
      "fullAddress",
      "address",
      "siteAddress",
      "label",
      "name",
      "value",
      "title",
      "description",
      "text",
      "postcode",
    ] as const

    for (const key of preferredKeys) {
      const candidate = record[key]
      const formatted: string = formatDisplayValue(candidate)
      if (formatted !== "-") return formatted
    }

    const values: string[] = Object.values(record)
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
  eligibility: EligibilityData | null,
  fieldKey: EligibilityFieldKey
): string {
  if (!eligibility) return "-"

  const mapping = eligibilityFieldMappings[fieldKey]
  const value = getEligibilityFieldValue(eligibility, fieldKey)

  if (mapping.format === "date") {
    return typeof value === "string" ? formatDateValue(value) : "-"
  }

  return formatDisplayValue(value)
}

function buildEligibilityRows(
  eligibility: EligibilityData | null,
  fieldKeys: EligibilityFieldKey[]
): EligibilityRow[] {
  if (!eligibility) return []

  return fieldKeys.map((fieldKey) => ({
    key: fieldKey,
    label: eligibilityFieldMappings[fieldKey].label,
    value: formatEligibilityFieldValue(eligibility, fieldKey),
    kind: longEligibilityFieldKeys.has(fieldKey) ? "block" : "default",
  }))
}

function isAnsweredEligibilityValue(value: string) {
  return value !== "-"
}

function formatDimensionSummary(first: string, second: string) {
  if (first === "-" || second === "-") return "-"
  return `${first}m x ${second}m`
}

function getToneIcon(tone: "blue" | "indigo" | "amber" | "emerald") {
  switch (tone) {
    case "blue":
      return <Home size={14} className="text-blue-600" />
    case "indigo":
      return <Ruler size={14} className="text-indigo-600" />
    case "amber":
      return <Shield size={14} className="text-amber-600" />
    case "emerald":
      return <Droplets size={14} className="text-emerald-600" />
    default:
      return <FileCheck size={14} className="text-blue-600" />
  }
}

function getEligibilityToneClasses(tone: "blue" | "indigo" | "amber" | "emerald") {
  switch (tone) {
    case "blue":
      return {
        card: "border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
      }
    case "indigo":
      return {
        card: "border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50",
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
      }
    case "amber":
      return {
        card: "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-slate-50",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
      }
    case "emerald":
      return {
        card: "border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
      }
  }
}

function buildRoadmapWithEligibility(
  baseRoadmap: WorkspaceRoadmapResponse,
  eligibility: EligibilityData | null
): WorkspaceRoadmapResponse {
  if (!eligibility) {
    return baseRoadmap
  }

  const eligibilityStage: WorkspaceRoadmapStage = {
    id: "eligibility-check",
    label: "Eligibility Check",
    desc: eligibility.completionStatus.isCompleted
      ? "Eligibility form completed."
      : `Eligibility form in progress (${eligibility.completionStatus.percentage}% complete).`,
    opensSection: "project",
  }

  const stagesWithoutEligibility = baseRoadmap.stages.filter(
    (stage) => stage.id !== "eligibility-check"
  )
  const insertIndex = Math.min(1, stagesWithoutEligibility.length)
  const stages = [
    ...stagesWithoutEligibility.slice(0, insertIndex),
    eligibilityStage,
    ...stagesWithoutEligibility.slice(insertIndex),
  ]

  return {
    currentStageId: eligibility.completionStatus.isCompleted
      ? baseRoadmap.currentStageId
      : "eligibility-check",
    stages,
  }
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function UserDetailsPage() {
  const { id } = useParams()
  const projectId = Array.isArray(id) ? id[0] : id
  const searchParams = useSearchParams()
  const {
    notifyRequiredDocsSentToAgentY,
    logs,
    requiredForCustomer,
    state: documentState,
    loadChecklistFromAgentY,
    toggleRequestForCustomer,
    markReceivedFromAgentY,
  } = useDocumentMediation(projectId ?? "unknown-project")
  const selectedSection = getInitialSection(searchParams.get("section"))
  const stepParam = searchParams.get("step")
  const [open, setOpen] = useState(false)
  const [assignStage, setAssignStage] = useState<"preview" | "success">("preview")
  const [agentYAssigned, setAgentYAssigned] = useState(false)
  const [showHandoverAnimation, setShowHandoverAnimation] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes] = useState([
    "Client confirmed boundary survey booked for 24 Feb.",
  ])
  const [activeSection, setActiveSection] = useState<SectionId>(selectedSection)
  const [baseRoadmap, setBaseRoadmap] = useState<WorkspaceRoadmapResponse>(
    defaultWorkspaceRoadmap
  )
  const [roadmap, setRoadmap] = useState<WorkspaceRoadmapResponse>(
    defaultWorkspaceRoadmap
  )
  const [currentStageId, setCurrentStageId] = useState(
    defaultWorkspaceRoadmap.currentStageId
  )
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null)
  const [eligibilityLoading, setEligibilityLoading] = useState(true)
  const [showEmptyEligibilityFields, setShowEmptyEligibilityFields] = useState(false)
  const [expandedEligibilityGroups, setExpandedEligibilityGroups] = useState<Record<string, boolean>>(
    defaultExpandedEligibilityGroups
  )
  const [pendingDocRequest, setPendingDocRequest] = useState(false)
  const router = useRouter()
  const roadmapStages = roadmap.stages
  const currentStepIndex = roadmapStages.findIndex(
    (stage) => stage.id === currentStageId
  )
  const currentStep = currentStepIndex >= 0 ? currentStepIndex : 0
  const activeRoadmapStage = roadmapStages[currentStep]

  useEffect(() => {
    let active = true

    const loadRoadmap = async () => {
      const response = await getWorkspaceRoadmap()
      if (!active) return
      setBaseRoadmap(response)
    }

    void loadRoadmap()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadEligibility = async () => {
      if (!projectId) {
        setEligibilityLoading(false)
        return
      }

      setEligibilityLoading(true)

      try {
        const response = await axiosInstance.get<EligibilityResponse>(
          `/eligibility/${encodeURIComponent(projectId)}`
        )
        if (!active) return
        setEligibilityData(response.data.data ?? null)
      } catch {
        if (!active) return
        setEligibilityData(null)
      } finally {
        if (active) {
          setEligibilityLoading(false)
        }
      }
    }

    void loadEligibility()

    return () => {
      active = false
    }
  }, [projectId])

  useEffect(() => {
    setRoadmap(buildRoadmapWithEligibility(baseRoadmap, eligibilityData))
  }, [baseRoadmap, eligibilityData])

  useEffect(() => {
    setActiveSection(selectedSection)
  }, [selectedSection])

  useEffect(() => {
    const currentStageExists = roadmapStages.some(
      (stage) => stage.id === currentStageId
    )
    if (!currentStageExists) {
      setCurrentStageId(roadmap.currentStageId)
    }
  }, [currentStageId, roadmap.currentStageId, roadmapStages])

  useEffect(() => {
    if (
      !stepParam &&
      currentStageId === defaultWorkspaceRoadmap.currentStageId &&
      roadmap.currentStageId !== currentStageId
    ) {
      setCurrentStageId(roadmap.currentStageId)
    }
  }, [currentStageId, roadmap.currentStageId, stepParam])

  useEffect(() => {
    if (!stepParam) return
    const matchedStage = roadmapStages.find((stage) => stage.queryStep === stepParam)
    if (matchedStage) {
      setCurrentStageId(matchedStage.id)
    }
  }, [roadmapStages, stepParam])

  useEffect(() => {
    if (activeRoadmapStage?.id !== "received-checklist") return
    if (documentState.checklist.length > 0) return
    loadChecklistFromAgentY()
  }, [activeRoadmapStage?.id, documentState.checklist.length, loadChecklistFromAgentY])

  useEffect(() => {
    if (!pendingDocRequest) return
    if (documentState.checklist.length === 0) return
    const requiredDocs = documentState.checklist.filter((doc) => doc.required)
    requiredDocs.forEach((doc) => toggleRequestForCustomer(doc.id, true))
    if (requiredDocs[0]) {
      markReceivedFromAgentY(requiredDocs[0].id)
    }
    setPendingDocRequest(false)
  }, [
    pendingDocRequest,
    documentState.checklist,
    toggleRequestForCustomer,
    markReceivedFromAgentY,
  ])

  const openStage = (stage: WorkspaceRoadmapStage) => {
    setCurrentStageId(stage.id)
    setActiveSection(stage.opensSection)
    if (projectId) {
      router.push(buildStageWorkspaceUrl(projectId, stage))
    }
  }

  const handleAdvanceAction = () => {
    const action = activeRoadmapStage?.action
    if (!action) return

    if (action.type === "activate-stage") {
      const targetStage = roadmapStages.find(
        (stage) => stage.id === action.targetStageId
      )
      if (!targetStage) return
      openStage(targetStage)
      return
    }

    if (action.targetSection) {
      setActiveSection(action.targetSection)
    }

    const nextHref = resolveRoadmapHref(action.hrefTemplate, projectId)
    if (nextHref) {
      router.push(nextHref)
    }
  }

  const handleRequestDocuments = () => {
    if (documentState.checklist.length === 0) {
      setPendingDocRequest(true)
      loadChecklistFromAgentY()
      return
    }
    const requiredDocs = documentState.checklist.filter((doc) => doc.required)
    requiredDocs.forEach((doc) => toggleRequestForCustomer(doc.id, true))
    if (requiredDocs[0]) {
      markReceivedFromAgentY(requiredDocs[0].id)
    }
  }

  const handleStepSelect = (index: number) => {
    const stage = roadmapStages[index]
    if (!stage) return
    openStage(stage)
  }

  const handleOpenAssignAgentYPreview = () => {
    setShowHandoverAnimation(true)
    window.setTimeout(() => {
      setShowHandoverAnimation(false)
      setAssignStage("preview")
      setOpen(true)
    }, 2200)
  }

  const handleConfirmSendToAgentY = () => {
    setAssignStage("success")
    setAgentYAssigned(true)
    notifyRequiredDocsSentToAgentY()
  }

  const handleAssignDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setAssignStage("preview")
    }
  }

  const addNote = () => {
    if (!noteText.trim()) return
    setNotes((prev) => [...prev, noteText.trim()])
    setNoteText("")
  }

  const progressValue =
    roadmapStages.length > 1
      ? Math.round((currentStep / (roadmapStages.length - 1)) * 100)
      : 0
  const missingDocsSentLog = logs.find(
    (log) => log.action === "Missing documents sent to Agent X"
  )
  const requiredDocsSentLog = logs.find(
    (log) => log.action === "Required documents sent to Agent Y"
  )
  const agentYSubmittedCount = logs.filter(
    (log) => log.action === "Agent Y submitted missing document"
  ).length
  const checklistLoaded = documentState.checklist.length > 0
  const requiredChecklistNames = documentState.checklist
    .filter((doc) => doc.required)
    .map((doc) => doc.name)
  const pendingEligibilitySteps =
    eligibilityData?.completionStatus.steps
      .filter((step) => !step.completed)
      .map((step) => step.label) ?? []
  const applicantName = eligibilityData ? getEligibilityApplicantName(eligibilityData) ?? "-" : "-"
  const applicantEmail = formatEligibilityFieldValue(eligibilityData, "emailAddress")
  const applicantPhone = formatDisplayValue(
    eligibilityData
      ? getEligibilityFieldValue(eligibilityData, "phoneNumber") ??
          getFirstMappedValue(eligibilityData, [
            ["applicantAndProperty", "applicantDetails", "contactEmailPhone"],
          ])
      : undefined
  )
  const siteAddress = eligibilityData ? getEligibilitySiteAddress(eligibilityData) ?? "-" : "-"
  const postcode = formatEligibilityFieldValue(eligibilityData, "postcode")
  const purposeOfDevelopment = formatEligibilityFieldValue(
    eligibilityData,
    "purposeOfDevelopment"
  )
  const propertyType = formatEligibilityFieldValue(eligibilityData, "propertyType")
  const ownershipStatus = formatEligibilityFieldValue(
    eligibilityData,
    "ownershipStatus"
  )
  const existingPropertyWidth = formatEligibilityFieldValue(
    eligibilityData,
    "existingPropertyWidthM"
  )
  const existingPropertyDepth = formatEligibilityFieldValue(
    eligibilityData,
    "existingPropertyDepthM"
  )
  const proposedExtensionWidth = formatEligibilityFieldValue(
    eligibilityData,
    "proposedExtensionWidthM"
  )
  const proposedExtensionDepth = formatEligibilityFieldValue(
    eligibilityData,
    "proposedExtensionDepthM"
  )
  const proposedWorksDescription = formatEligibilityFieldValue(
    eligibilityData,
    "proposedWorksDescription"
  )
  const wallMaterials = formatEligibilityFieldValue(eligibilityData, "wallMaterials")
  const listedBuilding = formatEligibilityFieldValue(eligibilityData, "isListedBuilding")
  const treesWithTPO = formatEligibilityFieldValue(eligibilityData, "treesWithTPO")
  const floodRiskArea = formatEligibilityFieldValue(
    eligibilityData,
    "isSiteInFloodRiskArea"
  )
  const vehicleAccess = formatEligibilityFieldValue(
    eligibilityData,
    "newOrAlteredAccess"
  )
  const preAppAdvice = formatEligibilityFieldValue(
    eligibilityData,
    "soughtPreAppAdvice"
  )
  const additionalConsents = formatEligibilityFieldValue(
    eligibilityData,
    "additionalConsents"
  )
  const councilName = formatEligibilityFieldValue(eligibilityData, "council")
  const councilReference = formatEligibilityFieldValue(
    eligibilityData,
    "planningReferenceNumber"
  )
  const locationPlanUrl = eligibilityData
    ? getEligibilityResourceValue(eligibilityData, "locationPlan")
    : undefined
  const sitePlanUrl = eligibilityData
    ? getEligibilityResourceValue(eligibilityData, "sitePlan")
    : undefined
  const existingAndProposedElevationsUrl = eligibilityData
    ? getEligibilityResourceValue(eligibilityData, "existingAndProposedElevations")
    : undefined
  const additionalDrawingsUrl = eligibilityData
    ? getEligibilityResourceValue(eligibilityData, "additionalDrawings")
    : undefined
  const photographsOfSiteUrl = eligibilityData
    ? getEligibilityResourceValue(eligibilityData, "photographsOfSite")
    : undefined
  const floodRiskAssessmentReportUrl = eligibilityData
    ? getEligibilityResourceValue(eligibilityData, "floodRiskAssessmentReport")
    : undefined
  const treeSurveyReportUrl = eligibilityData
    ? getEligibilityResourceValue(eligibilityData, "treeSurveyReport")
    : undefined
  const toggleEligibilityGroup = (groupId: string) => {
    setExpandedEligibilityGroups((prev) => ({
      ...prev,
      [groupId]: !(prev[groupId] ?? false),
    }))
  }
  const submissionApplicantRows = eligibilityData
    ? [
        { key: "applicantName", label: "Applicant Name", value: applicantName },
        {
          key: "siteAddress",
          label: "Site Address",
          value: siteAddress,
          kind: "block",
        },
        ...buildEligibilityRows(eligibilityData, submissionApplicantFieldKeys),
      ]
    : []
  const submissionPropertyRows = eligibilityData
    ? buildEligibilityRows(eligibilityData, submissionPropertyFieldKeys)
    : []
  const dimensionsRows = eligibilityData
    ? buildEligibilityRows(eligibilityData, dimensionFieldKeys)
    : []
  const materialsRows = eligibilityData
    ? buildEligibilityRows(eligibilityData, materialsFieldKeys)
    : []
  const constraintRows = eligibilityData
    ? buildEligibilityRows(eligibilityData, constraintFieldKeys)
    : []
  const constraintSupportRows = eligibilityData
    ? buildEligibilityRows(eligibilityData, constraintSupportFieldKeys)
    : []
  const eligibilityDetailSections = eligibilityData
    ? eligibilityDetailGroups.map((group) => ({
        ...group,
        rows: [
          ...buildEligibilityRows(eligibilityData, group.fieldKeys),
          ...(group.extraRows ? group.extraRows(eligibilityData) : []),
        ],
        links:
          group.id === "works-materials"
            ? [
                { label: "Location Plan", url: locationPlanUrl },
                { label: "Site Plan", url: sitePlanUrl },
                { label: "Elevations", url: existingAndProposedElevationsUrl },
                { label: "Additional Drawings", url: additionalDrawingsUrl },
                { label: "Site Photographs", url: photographsOfSiteUrl },
              ].filter((item) => typeof item.url === "string")
            : group.id === "site-constraints"
            ? [
                { label: "Flood Risk Assessment", url: floodRiskAssessmentReportUrl },
                { label: "Tree Survey Report", url: treeSurveyReportUrl },
              ].filter((item) => typeof item.url === "string")
            : [],
      }))
        .map((group) => {
          const answeredCount = group.rows.filter((row) =>
            isAnsweredEligibilityValue(row.value)
          ).length
          const visibleRows = showEmptyEligibilityFields
            ? group.rows
            : group.rows.filter((row) => isAnsweredEligibilityValue(row.value))

          return {
            ...group,
            answeredCount,
            totalCount: group.rows.length,
            visibleRows,
          }
        })
    : []
  const answeredEligibilitySectionCount = eligibilityDetailSections.filter(
    (group) => group.answeredCount > 0 || group.links.length > 0
  ).length
  const customer = {
    name: applicantName,
    phone: applicantPhone,
    email: applicantEmail,
    location: siteAddress,
    status: eligibilityData ? formatEligibilityStatus(eligibilityData.status) : "Live Data Pending",
  }
  const formSubmission = {
    applicantName,
    contactEmail: applicantEmail,
    contactPhone: applicantPhone,
    siteAddress,
    postcode,
    propertyType,
    ownershipStatus,
    conservationArea: formatEligibilityFieldValue(eligibilityData, "isInConservationArea"),
    purposeOfDevelopment,
    existingWidth: existingPropertyWidth,
    existingDepth: existingPropertyDepth,
    proposedExtensionWidth,
    proposedExtensionDepth,
    externalMaterials: wallMaterials,
    briefDescription: proposedWorksDescription,
    listedBuilding,
    tpo: treesWithTPO,
    floodZone: floodRiskArea,
    vehicleAccess,
    preApplicationAdvice: preAppAdvice,
    additionalConsents,
    consultationBooked: false,
    consultationDate: "-",
    consultationTime: "-",
    consultant: "-",
    consultantTitle: "-",
    consultationType: "-",
    consultationDuration: "-",
  }
  const project = {
    id: projectId ?? "Unknown",
    clientId: "-",
    clientName: applicantName,
    title: `Project ${projectId ?? "Unknown"}`,
    description: eligibilityData
      ? "Live project details derived from the connected eligibility record."
      : "No live project metadata connected yet.",
    service: purposeOfDevelopment,
    serviceType: propertyType,
    serviceNo: "-",
    stage: activeRoadmapStage?.label ?? "Unknown",
    location: siteAddress,
    postcode,
    status: eligibilityData?.status ?? "live_data_pending",
    createdDate: eligibilityData?.createdAt ?? "",
    updatedDate: eligibilityData?.updatedAt ?? "",
    agentX: "-",
    agentY: "-",
    architect: "-",
    progress: eligibilityData?.completionStatus.percentage ?? 0,
    estimatedCompletionDate: eligibilityData?.updatedAt ?? "",
    councilReference,
    councilName,
    timeline: "-",
  }
  const requirements = {
    propertyType,
    locationType: siteAddress,
    timeline: "-",
    scope: [
      formSubmission.purposeOfDevelopment,
      formSubmission.briefDescription,
    ].filter((item) => item !== "-"),
    constraints: [
      `Listed Building: ${formSubmission.listedBuilding}`,
      `Flood Zone: ${formSubmission.floodZone}`,
      `TPO: ${formSubmission.tpo}`,
    ],
    notes: "No additional live requirement notes connected yet.",
  }
  const quote = {
    reference: "-",
    submittedOn: "-",
    status: "pending",
    total: "-",
    breakdown: [] as { label: string; amount: string; pct: number }[],
  }
  const journeySteps = roadmapStages.map((stage) =>
    stage.id === "received-checklist"
      ? {
          ...stage,
          details: requiredChecklistNames,
          detailsLabel: "Required documents",
          desc: !checklistLoaded
            ? "Checklist pending from Agent Y."
            : requiredChecklistNames.length > 0
            ? "Checklist received. Required documents listed below."
            : "Checklist received. No required documents flagged.",
        }
      : stage.id === "eligibility-check" && eligibilityData
      ? {
          ...stage,
          details: pendingEligibilitySteps,
          detailsLabel: "Pending eligibility sections",
          desc: eligibilityData.completionStatus.isCompleted
            ? "Eligibility form completed and ready for the next stage."
            : `Eligibility form is ${eligibilityData.completionStatus.percentage}% complete.`,
        }
      : stage
  )
  const sectionMeta: Record<SectionId, { title: string; hint: string }> = {
    project: {
      title: "Project Overview",
      hint: "Snapshot of progress, client context, and delivery status.",
    },
    coordination: {
      title: "Document Requests",
      hint: "Agent X mediation flow between Agent Y and customer.",
    },
    communication: {
      title: "Client Communication",
      hint: "Customer communication channel managed only by Agent X.",
    },
    documents: {
      title: "Project Documents",
      hint: "Required docs from Agent Y and customer uploads managed in one place.",
    },
    payments: {
      title: "Payment Details",
      hint: "Payment milestones and pending balance visibility.",
    },
    notes: {
      title: "Internal Notes",
      hint: "Private operational notes for Agent X workspace.",
    },
    requirements: {
      title: "Client Requirements",
      hint: "Scope, constraints, and requirements from customer brief.",
    },
    submission: {
      title: "Form Submission",
      hint: "Original customer submission and property details.",
    },
    dimensions: {
      title: "Dimensions",
      hint: "Existing and proposed build dimensions and materials.",
    },
    constraints: {
      title: "Constraints",
      hint: "Planning restrictions and risk flags.",
    },
    consultation: {
      title: "Consultation",
      hint: "Consultation schedule and expert assignment details.",
    },
    quote: {
      title: "Quote Summary",
      hint: "Project financial breakdown and quote status.",
    },
    profile: {
      title: "Customer Profile",
      hint: "Customer identity and contact information.",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      {/* ?????? JOURNEY TRACKER ?????? */}
      <CustomerJourney
      steps={journeySteps}
      currentStep={currentStep}
      showAdvance={Boolean(activeRoadmapStage?.action)}
      calloutActions={
        activeRoadmapStage?.callout === "assign-agent-y" ? (
          <button
            type="button"
            onClick={agentYAssigned ? undefined : handleOpenAssignAgentYPreview}
            disabled={agentYAssigned}
            className={`inline-flex items-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 transition-colors ${
              agentYAssigned
                ? "bg-emerald-100 text-emerald-800 cursor-default"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {agentYAssigned ? <CheckCircle size={15} /> : <Send size={15} />}
            {agentYAssigned ? "Assigned" : "Assign Agent Y"}
          </button>
        ) : null
      }
      advanceLabel={activeRoadmapStage?.action?.label ?? "Advance"}
      onAdvance={handleAdvanceAction}
      onStepSelect={handleStepSelect}
    />

      {/* ── MAIN CONTENT WITH SIDEBAR ── */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
          {/* ── LEFT: CONTENT AREA ── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
            <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {sectionMeta[activeSection].title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sectionMeta[activeSection].hint}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-white border px-2.5 py-1 text-slate-600">
                    Project {projectId ?? "Unknown"}
                  </span>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-blue-700">
                    Agent X Workspace
                  </span>
                  
                </div>
              </div>
            </div>

            
            {activeSection === "submission" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Application Form Submission
                  </h2>
                </div>
                {eligibilityData ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <OverviewCard title="Applicant Details" icon={<User size={14} className="text-blue-600" />}>
                      <div className="space-y-2">
                        {submissionApplicantRows.map((row) => (
                          <InfoPair key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    </OverviewCard>
                    <OverviewCard title="Property Details" icon={<Home size={14} className="text-emerald-600" />}>
                      <div className="space-y-2">
                        {submissionPropertyRows.map((row) => (
                          <InfoPair key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    </OverviewCard>
                  </div>
                ) : (
                  <LiveDataPlaceholder
                    title="Submission data not connected"
                    message="This section will show the submitted application details once a live project form endpoint is connected."
                  />
                )}
              </div>
            )}

            {activeSection === "dimensions" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Project Dimensions
                  </h2>
                </div>
                {eligibilityData ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <OverviewCard title="Dimensions" icon={<Ruler size={14} className="text-blue-600" />}>
                      <div className="space-y-2">
                        {dimensionsRows.map((row) => (
                          <InfoPair key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    </OverviewCard>
                    <OverviewCard title="Materials + Drawings" icon={<Building2 size={14} className="text-amber-600" />}>
                      <div className="space-y-2">
                        {materialsRows.map((row) => (
                          <InfoPair key={row.label} label={row.label} value={row.value} />
                        ))}
                        {typeof locationPlanUrl === "string" ? (
                          <a
                            href={locationPlanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink size={14} />
                            Open location plan
                          </a>
                        ) : null}
                      </div>
                    </OverviewCard>
                  </div>
                ) : (
                  <LiveDataPlaceholder
                    title="Dimension data not connected"
                    message="Live dimension and drawing details will appear here when available from the project APIs."
                  />
                )}
              </div>
            )}

            {activeSection === "constraints" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Planning Constraints
                  </h2>
                </div>
                {eligibilityData ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <OverviewCard title="Site Constraints" icon={<AlertTriangle size={14} className="text-amber-600" />}>
                      <div className="space-y-2">
                        {constraintRows.map((row) => (
                          <InfoPair key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    </OverviewCard>
                    <OverviewCard title="Trees + Consents" icon={<TreePine size={14} className="text-emerald-600" />}>
                      <div className="space-y-2">
                        {constraintSupportRows.map((row) => (
                          <InfoPair key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    </OverviewCard>
                  </div>
                ) : (
                  <LiveDataPlaceholder
                    title="Constraint data not connected"
                    message="This section now avoids hardcoded planning constraints and will only show live values."
                  />
                )}
              </div>
            )}

            {activeSection === "consultation" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Consultation Booking
                  </h2>
                </div>
                <LiveDataPlaceholder
                  title="Consultation data not connected"
                  message="The previous hardcoded consultation booking has been removed. This section will show real consultation details once that API is wired in."
                />
              </div>
            )}

            {/* COORDINATION HUB */}
            {activeSection === "coordination" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Agent X Mediation Workflow
                  </h2>
                </div>

                <div className="rounded-xl border bg-white p-5 mb-6">
                  <p className="text-sm font-bold text-slate-900 mb-4">
                    Document Request Flow
                  </p>
                  <div className="grid md:grid-cols-5 gap-3">
                    <FlowStepCard
                      step="1"
                      title="Agent Y Request"
                      desc="Agent Y marks missing project document."
                      status="done"
                    />
                    <FlowStepCard
                      step="2"
                      title="Agent X Review"
                      desc="Agent X verifies request and required file list."
                      status="done"
                    />
                    <FlowStepCard
                      step="3"
                      title="Contact Customer"
                      desc="Agent X asks customer for required documents."
                      status="in_progress"
                    />
                    <FlowStepCard
                      step="4"
                      title="Validation"
                      desc="Agent X checks file quality/completeness."
                      status="pending"
                    />
                    <FlowStepCard
                      step="5"
                      title="Share to Agent Y"
                      desc="Agent X sends verified files for next action."
                      status="pending"
                    />
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4 mb-6">
                  <OverviewCard title="Customer Request State" icon={<Upload size={14} className="text-blue-600" />}>
                    <div className="space-y-2">
                      <InfoPair label="Project" value={projectId ?? "Unknown"} />
                      <InfoPair label="Docs Requested From Customer" value={requiredForCustomer.length} />
                      <InfoPair label="Checklist Loaded" value={documentState.checklist.length > 0} />
                    </div>
                  </OverviewCard>

                  <OverviewCard title="Agent Y Handover State" icon={<Bot size={14} className="text-amber-600" />}>
                    <div className="space-y-2">
                      <InfoPair label="Checklist Items" value={documentState.checklist.length} />
                      <InfoPair label="Missing Docs Sent To Agent X" value={Boolean(missingDocsSentLog)} />
                      <InfoPair label="Required Docs Sent To Agent Y" value={Boolean(requiredDocsSentLog)} />
                      <InfoPair label="Agent Y Upload Events" value={agentYSubmittedCount} />
                    </div>
                  </OverviewCard>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Coordination Rule
                  </p>
                  <p className="text-sm text-slate-700">
                    Agent Y cannot proceed until Agent X receives, validates, and forwards required customer documents.
                  </p>
                </div>
              </div>
            )}

            {/* PROJECT OVERVIEW */}
            {activeSection === "project" && (
              <div>
                {activeRoadmapStage?.id === "eligibility-check" && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileCheck size={18} className="text-blue-600" />
                      <h2 className="text-lg font-bold text-slate-900">
                        Eligibility Details
                      </h2>
                    </div>

                    {eligibilityLoading ? (
                      <div className="rounded-xl border bg-slate-50 p-5 text-sm text-slate-500">
                        Loading eligibility details...
                      </div>
                    ) : eligibilityData ? (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                              <EligibilitySummaryItem label="Applicant" value={applicantName} />
                              <EligibilitySummaryItem label="Site Address" value={siteAddress} />
                              <EligibilitySummaryItem label="Property Type" value={propertyType} />
                              <EligibilitySummaryItem label="Council" value={councilName} />
                              <EligibilitySummaryItem
                                label="Completion"
                                value={`${eligibilityData.completionStatus.percentage}%`}
                                hint={formatEligibilityStatus(eligibilityData.status)}
                              />
                            </div>
                            <div className="flex items-center gap-2 self-start">
                              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                {answeredEligibilitySectionCount}/{eligibilityDetailSections.length} sections answered
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowEmptyEligibilityFields((prev) => !prev)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                {showEmptyEligibilityFields ? "Hide empty fields" : "Show empty fields"}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {eligibilityDetailSections.map((group) => (
                            <EligibilitySectionCard
                              key={group.id}
                              title={group.title}
                              icon={getToneIcon(group.tone)}
                              tone={group.tone}
                              expanded={expandedEligibilityGroups[group.id] ?? false}
                              answeredCount={group.answeredCount}
                              totalCount={group.totalCount}
                              onToggle={() => toggleEligibilityGroup(group.id)}
                            >
                              {group.visibleRows.length > 0 ? (
                                <div className="space-y-2 text-sm text-slate-700">
                                  {group.visibleRows.map((row) => (
                                    <EligibilityValueRow
                                      key={`${group.id}-${row.key}`}
                                      label={row.label}
                                      value={row.value}
                                      kind={row.kind}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
                                  {showEmptyEligibilityFields
                                    ? "No fields are available in this section yet."
                                    : "No answered fields in this section yet."}
                                </div>
                              )}
                              {group.links.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {group.links.map((link) => (
                                    <EligibilityDocumentLink
                                      key={`${group.id}-${link.label}`}
                                      label={link.label}
                                      href={link.url as string}
                                    />
                                  ))}
                                </div>
                              ) : null}
                            </EligibilitySectionCard>
                          ))}
                        </div>

                      </div>
                    ) : (
                      <div className="rounded-xl border bg-slate-50 p-5 text-sm text-slate-500">
                        No eligibility details were found for this project.
                      </div>
                    )}
                  </div>
                )}

                {/* Project Header */}
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border p-5 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {project.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Project ID
                      </p>
                      <p className="font-mono font-bold text-slate-900">
                        {project.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Service Type
                      </p>
                      <p className="font-semibold text-slate-900 capitalize">
                        {project.serviceType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Details Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <MetaBox
                    icon={<MapPin size={14} className="text-rose-500" />}
                    label="Location"
                    value={project.location}
                  />
                  <MetaBox
                    icon={<Building2 size={14} className="text-blue-500" />}
                    label="Postcode"
                    value={project.postcode}
                  />
                  <MetaBox
                    icon={<Calendar size={14} className="text-emerald-500" />}
                    label="Created"
                    value={formatDateValue(project.createdDate)}
                  />
                  <MetaBox
                    icon={<Calendar size={14} className="text-amber-500" />}
                    label="Est. Completion"
                    value={formatDateValue(project.estimatedCompletionDate)}
                  />
                </div>

                {/* Snapshot cards to keep overview concise */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  <OverviewCard
                    title="Form Submission"
                    icon={<FileCheck size={14} className="text-emerald-600" />}
                  >
                    <p className="text-sm font-semibold text-slate-900">{formSubmission.purposeOfDevelopment}</p>
                    <p className="text-xs text-slate-500 mt-1">{formSubmission.propertyType}</p>
                    <p className="text-xs text-slate-500 mt-1">{formSubmission.siteAddress}</p>
                  </OverviewCard>

                  <OverviewCard
                    title="Dimensions"
                    icon={<Ruler size={14} className="text-blue-600" />}
                  >
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Existing width × depth</span>
                        <span className="font-semibold text-slate-800">
                          {formatDimensionSummary(
                            formSubmission.existingWidth,
                            formSubmission.existingDepth
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Proposed width × depth</span>
                        <span className="font-semibold text-blue-800">
                          {formatDimensionSummary(
                            formSubmission.proposedExtensionWidth,
                            formSubmission.proposedExtensionDepth
                          )}
                        </span>
                      </div>
                    </div>
                  </OverviewCard>

                  <OverviewCard
                    title="Constraints"
                    icon={<Shield size={14} className="text-amber-600" />}
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">Listed: {formSubmission.listedBuilding}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">TPO: {formSubmission.tpo}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">Flood: {formSubmission.floodZone}</span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">Access: {formSubmission.vehicleAccess}</span>
                    </div>
                  </OverviewCard>

                  <OverviewCard
                    title="Requirements"
                    icon={<FileText size={14} className="text-indigo-600" />}
                  >
                    <p className="text-xs text-slate-500 mb-2">Timeline: {requirements.timeline}</p>
                    <ul className="space-y-1">
                      {requirements.scope.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-700">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </OverviewCard>

                  <OverviewCard
                    title="Customer Journey"
                    icon={<TrendingUp size={14} className="text-blue-600" />}
                  >
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      Step {currentStep + 1} of {roadmapStages.length}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      {activeRoadmapStage?.label ?? "In progress"}
                    </p>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${progressValue}%` }} />
                    </div>
                  </OverviewCard>

                  <OverviewCard
                    title="User Profile"
                    icon={<User size={14} className="text-rose-600" />}
                  >
                    <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{customer.email}</p>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </OverviewCard>
                </div>

                {/* Team Section */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    Project Team
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <TeamMember label="Agent X" name={project.agentX} />
                    <TeamMember label="Agent Y" name={project.agentY} />
                    <TeamMember label="Architect" name={project.architect} />
                  </div>
                </div>

                {/* Council Information */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-900 mb-1">
                        Council Information
                      </p>
                      <p className="text-sm font-bold text-amber-900">
                        {project.councilName}
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Reference: {project.councilReference}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REQUIREMENTS */}
            {activeSection === "requirements" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Client Requirements
                  </h2>
                </div>

                {/* Service Context */}
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Selected Service
                      </p>
                      <p className="text-base font-bold text-slate-900">
                        {project.service}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      Active Service
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Service ID · {project.serviceNo}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <MetaBox
                    icon={<Building2 size={14} className="text-blue-500" />}
                    label="Property Type"
                    value={requirements.propertyType}
                  />
                  <MetaBox
                    icon={<MapPin size={14} className="text-rose-500" />}
                    label="Location Type"
                    value={requirements.locationType}
                  />
                  <MetaBox
                    icon={<Clock size={14} className="text-amber-500" />}
                    label="Timeline"
                    value={requirements.timeline}
                  />
                </div>

                {/* Scope & Constraints */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <CheckCircle size={13} className="text-emerald-500" />
                      Scope of Work
                    </p>
                    <ul className="space-y-2">
                      {requirements.scope.map((s, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-900 mb-3 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-amber-600" />
                      Constraints
                    </p>
                    <ul className="space-y-2">
                      {requirements.constraints.map((c, i) => (
                        <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Notes */}
                <div className="rounded-xl border bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <StickyNote size={13} className="text-blue-600" />
                    Client Notes
                  </p>
                  <p className="text-sm text-blue-900 leading-relaxed">
                    {requirements.notes}
                  </p>
                </div>
              </div>
            )}

            {/* QUOTE SUMMARY */}
            {activeSection === "quote" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Banknote size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Quote Summary
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-slate-50 rounded-xl border p-5 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        {quote.reference}
                      </p>
                      <p className="text-xs text-slate-500">
                        Submitted {quote.submittedOn}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        quote.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {quote.breakdown.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-xl border bg-slate-50 px-4 py-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">
                          {b.label}
                        </p>
                        <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${b.pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-slate-900">
                          {b.amount}
                        </p>
                        <p className="text-xs text-slate-500">{b.pct}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-blue-600 text-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Total Project Value</p>
                    <p className="text-2xl font-bold">{quote.total}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "documents" && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-600">Document Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRequestDocuments}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      <Send size={13} />
                      Send to Client
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Upload size={13} />
                      Upload Manually
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border bg-white p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-900">Required Documents</p>
                    <span className="text-[11px] text-slate-500">
                      {requiredForCustomer.length} item{requiredForCustomer.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {requiredForCustomer.length === 0 ? (
                    <p className="text-xs text-slate-500">No required documents yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {requiredForCustomer.map((doc) => (
                        <div key={doc.id} className="rounded-lg border bg-slate-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-800">{doc.name}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                doc.required ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {doc.required ? "Required" : "Optional"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{doc.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Allowed: {doc.allowedFileTypes.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeSection === "communication" && (
              <div className="rounded-xl border bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-900">Chat moved to dedicated workspace pages.</p>
                <Link href={`/projects/${id}/workspace/customer-chat`} className="inline-flex mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  Open Customer Chat
                </Link>
              </div>
            )}

            {/* PROFILE */}
            {activeSection === "profile" && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <User size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Customer Profile
                  </h2>
                </div>
                <div className="space-y-3">
                  <ProfileRow
                    icon={<Phone size={13} className="text-blue-500" />}
                    label="Phone"
                    value={customer.phone}
                  />
                  <ProfileRow
                    icon={<Mail size={13} className="text-emerald-500" />}
                    label="Email"
                    value={customer.email}
                  />
                  <ProfileRow
                    icon={<MapPin size={13} className="text-rose-500" />}
                    label="Location"
                    value={customer.location}
                  />
                </div>
              </div>
            )}

                        {activeSection === "payments" && (
              <div className="rounded-xl border bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-900">Payment details moved to dedicated workspace page.</p>
                <Link href={`/projects/${id}/workspace/payments`} className="inline-flex mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  Open Payment Details
                </Link>
              </div>
            )}

            {/* NOTES */}
            {activeSection === "notes" && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <StickyNote size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Internal Notes
                  </h2>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                  {notes.map((n, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-amber-50 border border-amber-100 px-3.5 py-2.5 text-sm text-amber-900 leading-relaxed"
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNote()}
                    placeholder="Add internal note…"
                    className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                  <button
                    onClick={addNote}
                    className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <Lock size={10} />
                  Never shared externally
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* HANDOVER ORCHESTRATION ANIMATION */}
      <Dialog open={showHandoverAnimation} onOpenChange={setShowHandoverAnimation}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden max-h-[92vh]" showCloseButton={false}>
          <div className="bg-white">
            <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between">
              <p className="text-sm sm:text-base font-bold text-slate-800">
                Agent Handover Orchestration
              </p>
              <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">
                Process ID: {project.id}
              </span>
            </div>

            <div className="relative p-6 sm:p-10 min-h-[260px] sm:min-h-[320px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:14px_14px]">
              <div className="absolute left-[12%] right-[12%] top-1/2 h-px bg-blue-100 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[handoverPulse_1.2s_ease-in-out_infinite]" />
              </div>

              <div className="absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-8 h-8 rounded-xl bg-white border-2 border-blue-300 shadow-sm grid place-items-center animate-[handoverMove_1.6s_linear_infinite]">
                  <FileText size={14} className="text-blue-600" />
                </div>
              </div>

              <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-20 sm:w-24">
                <div className="rounded-2xl border-2 border-blue-500 bg-blue-50 p-3 sm:p-4 shadow-sm animate-[nodePulse_1.4s_ease-in-out_infinite]">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center mx-auto">
                    <Bot size={20} />
                  </div>
                </div>
                <p className="text-center text-sm font-bold text-slate-800 mt-2">Agent X</p>
                <p className="text-center text-xs text-slate-500">Sender</p>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-48">
                <div className="rounded-xl border-2 border-blue-200 bg-white p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-600" />
                    <div className="flex-1">
                      <div className="h-2 w-20 bg-slate-200 rounded mb-1" />
                      <div className="h-2 w-14 bg-slate-100 rounded" />
                    </div>
                    <div className="w-6 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold text-blue-700 mt-2">CLI FORM DATA</p>
                </div>
              </div>

              <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-20 sm:w-24">
                <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-3 sm:p-4 shadow-sm animate-[nodePulse_1.4s_ease-in-out_infinite] [animation-delay:0.2s]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white grid place-items-center mx-auto">
                    <Headphones size={20} />
                  </div>
                </div>
                <p className="text-center text-sm font-bold text-slate-800 mt-2">Agent Y</p>
                <p className="text-center text-xs text-slate-500">Receiver</p>
              </div>
            </div>
            <style jsx>{`
              @keyframes handoverMove {
                0% { transform: translateX(0); opacity: 0.2; }
                15% { opacity: 1; }
                85% { opacity: 1; }
                100% { transform: translateX(calc(76vw - 220px)); opacity: 0.2; }
              }
              @keyframes nodePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.03); }
              }
              @keyframes handoverPulse {
                0% { transform: translateX(-100%); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateX(300%); opacity: 0; }
              }
              @media (min-width: 640px) {
                @keyframes handoverMove {
                  0% { transform: translateX(0); opacity: 0.2; }
                  15% { opacity: 1; }
                  85% { opacity: 1; }
                  100% { transform: translateX(calc(100% - 2rem)); opacity: 0.2; }
                }
              }
            `}</style>
          </div>
        </DialogContent>
      </Dialog>

      {/* ASSIGN AGENT Y PREVIEW MODAL */}
      <Dialog open={open} onOpenChange={handleAssignDialogOpenChange}>
  <DialogContent
    className="w-[95vw] max-w-5xl p-0 overflow-hidden max-h-[92vh]"
    showCloseButton={false}
  >
    <div className="bg-white max-h-[92vh] flex flex-col">
      {assignStage === "preview" ? (
      <>

      {/* ───────── HEADER ───────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <DialogTitle className="flex items-center gap-2 text-md sm:text-xl lg:text-2xl font-extrabold text-slate-900">
              <Eye className="text-emerald-500" size={20} />
              Privacy Preview: Agent Y View
            </DialogTitle>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base font-semibold text-slate-500">
              PROJECT #{project.id} – HANDOVER STAGE
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="self-start rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close preview"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* ───────── INFO BAR ───────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 border-b bg-emerald-50 text-emerald-900 text-xs sm:text-sm flex items-start gap-2">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          <span className="font-semibold">Simulated View:</span>{" "}
          This interface shows exactly what Agent Y will see until handover is finalized.
        </span>
      </div>

      {/* ───────── BODY ───────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] min-h-0">

          {/* LEFT COLUMN */}
          <div className="p-4 sm:p-6 lg:p-8 lg:border-r">
            <div className="rounded-xl border bg-slate-50">

              <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-900 text-white grid place-items-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                      [PROTECTED] PROJECT
                    </p>
                    <p className="text-sm text-slate-500">Received from Agent X</p>
                  </div>
                </div>

                <span className="text-xs font-bold uppercase bg-slate-200 text-slate-700 px-3 py-1 rounded-md self-start">
                  Read Only
                </span>
              </div>

              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <MaskField label="Client Name" value="[PROTECTED]" />
                <MaskField label="Primary Phone" value="[PROTECTED]" />
                <MaskField label="Property Address" value="[PROTECTED]" />
                <MaskField label="Email Correspondence" value="[PROTECTED]" />
              </div>

              <div className="p-4 sm:p-6 border-t">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Attached Documents
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ProtectedDocumentCard />
                  <ProtectedDocumentCard />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="p-4 sm:p-6 lg:p-8 bg-slate-50">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Privacy Checklist
            </p>

            <div className="space-y-4 sm:space-y-5">
              <PrivacyCheckItem title="PII Masking Active" desc="Names and contact identifiers are obscured." />
              <PrivacyCheckItem title="Address Anonymization" desc="Specific house numbers hidden in the summary view." />
              <PrivacyCheckItem title="Log Audit Trail Enabled" desc="All Agent Y interactions will be recorded." />
              <PrivacyCheckItem title="Contact Encryption" desc="Encryption keys generated for the handover." />
            </div>

            <div className="mt-6 sm:mt-8 rounded-xl border bg-white p-4 text-xs sm:text-sm text-slate-500">
              Data will be decrypted only after Agent Y accepts the transfer and signs the recipient NDA.
            </div>
          </div>
        </div>
      </div>

      {/* ───────── FOOTER ───────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => setOpen(false)}
          className="w-full sm:w-auto rounded-xl border px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition"
        >
          Back to Edit
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <p className="text-xs sm:text-sm italic text-slate-400 hidden sm:block">
            Review required before sending
          </p>
          <button
            onClick={handleConfirmSendToAgentY}
            className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-white font-bold transition"
          >
            Confirm & Send to Agent Y
          </button>
        </div>
      </div>
      </>
      ) : (
      <div className="bg-emerald-50/50 max-h-[92vh] overflow-y-auto px-3 sm:px-6 py-6 sm:py-10">
        <div className="max-w-xl mx-auto rounded-2xl border bg-white shadow-sm p-5 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-4">
            <CheckCircle size={34} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Submission Successful
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            Project #{project.id} successfully assigned to Agent Y.
          </p>

          <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-left">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Assigned Deliverables
              </p>
              <span className="text-[10px] font-semibold rounded-full border bg-white px-2.5 py-1 text-slate-500">
                Data Redacted
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {(documentState.checklist.slice(0, 2).length > 0
                ? documentState.checklist.slice(0, 2).map((doc) => doc.name)
                : ["No live document names connected"]).map((item) => (
                <p key={item} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle size={14} className="text-emerald-500" />
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-slate-500">
              Privacy compliance verified. Client identifying data was redacted for this handover.
            </p>
          </div>

          <div className="mt-6 px-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="text-emerald-600">Assigned</span>
              <span className="text-emerald-700">In Progress with Agent Y</span>
              <span>Review</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white grid place-items-center">
                <CheckCircle size={12} />
              </div>
              <div className="flex-1 h-0.5 bg-emerald-300 mx-2" />
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-white" />
              <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setOpen(false)
                router.push(`/projects/${projectId}/workspace/project`)
              }}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition"
            >
              View Active Dashboard
            </button>
            <button
              onClick={() => {
                setOpen(false)
                router.push("/projects")
              }}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Back to Project List
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  </DialogContent>
</Dialog>

    </div>
  )
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function LiveDataPlaceholder({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="rounded-xl border bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  )
}

function MaskField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
        {label}
      </p>
      <div className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700">
        {value}
      </div>
    </div>
  )
}

function ProtectedDocumentCard() {
  return (
    <div className="rounded-lg border bg-white px-3 py-2.5 flex items-center gap-2">
      <FileText size={14} className="text-slate-400" />
      <div className="flex-1">
        <div className="h-2.5 w-28 bg-slate-200 rounded" />
        <div className="h-1.5 w-16 bg-slate-100 rounded mt-1.5" />
      </div>
    </div>
  )
}

function PrivacyCheckItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mt-0.5">
        <CheckCircle size={14} />
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  )
}

function FlowStepCard({
  step,
  title,
  desc,
  status,
}: {
  step: string
  title: string
  desc: string
  status: "done" | "in_progress" | "pending"
}) {
  const statusStyles =
    status === "done"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : status === "in_progress"
      ? "bg-blue-50 border-blue-200 text-blue-800"
      : "bg-slate-50 border-slate-200 text-slate-700"

  return (
    <div className={`rounded-xl border p-3 ${statusStyles}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full bg-white/80 border text-[10px] font-bold grid place-items-center">
          {step}
        </span>
        <p className="text-xs font-bold">{title}</p>
      </div>
      <p className="text-xs leading-relaxed">{desc}</p>
    </div>
  )
}

function EligibilitySummaryItem({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/80 px-3.5 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function EligibilitySectionCard({
  title,
  icon,
  tone,
  expanded,
  answeredCount,
  totalCount,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  tone: "blue" | "indigo" | "amber" | "emerald"
  expanded: boolean
  answeredCount: number
  totalCount: number
  onToggle: () => void
  children: React.ReactNode
}) {
  const styles = getEligibilityToneClasses(tone)

  return (
    <div className={`rounded-2xl border p-4 ${styles.card}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              {title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {answeredCount}/{totalCount} fields answered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}
          >
            {answeredCount}/{totalCount}
          </span>
          <span className="rounded-full border border-white/80 bg-white/80 p-1 text-slate-500">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </button>
      {expanded ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}

function EligibilityValueRow({
  label,
  value,
  kind = "default",
}: {
  label: string
  value: string
  kind?: "default" | "block"
}) {
  const isBooleanValue = value === "Yes" || value === "No"

  if (kind === "block") {
    return (
      <div className="rounded-xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-800">{value}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {isBooleanValue ? (
          <span
            className={`inline-flex self-start rounded-full px-2.5 py-1 text-xs font-semibold ${
              value === "Yes"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {value}
          </span>
        ) : (
          <span className="text-sm font-semibold text-slate-800 sm:max-w-[58%] sm:text-right">
            {value}
          </span>
        )}
      </div>
    </div>
  )
}

function EligibilityDocumentLink({
  label,
  href,
}: {
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
    >
      <ExternalLink size={14} />
      {label}
    </a>
  )
}

function InfoPair({
  label,
  value,
}: {
  label: string
  value?: unknown
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-800">
        {formatDisplayValue(value)}
      </span>
    </div>
  )
}

function MetaBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border bg-slate-50 px-3.5 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function OverviewCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3">
      <div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function TeamMember({ label, name }: { label: string; name: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 px-4 py-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{name}</p>
    </div>
  )
}


