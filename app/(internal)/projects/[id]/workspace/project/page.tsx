"use client"
import CustomerJourney from "@/components/CustomerJourney"
import Link from "next/link"
import SendToAgentAnimation from "@/components/SendToAgentAnimation"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import axiosInstance from "@/lib/axiosinstance"
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
  ChevronRight,
  Upload,
  Building2,
  Calendar,
  Ruler,
  AlertTriangle,
  MessageSquare,
  BadgeCheck,
  CircleDot,
  Circle,
  TrendingUp,
  StickyNote,
  Eye,
  User,
  Banknote,
  ExternalLink,
  Home,
  Shield,
  TreePine,
  Car,
  Droplets,
  Info,
  FileCheck,
  Video,
  Briefcase,
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

type EligibilityData = {
  _id: string
  projectId: string
  status: string
  currentStep: number
  createdAt: string
  updatedAt: string
  applicantAndProperty: {
    agentDetails: {
      agentAddress: string
      agentContactEmailPhone: string
      agentName: string
      usesPlanningAgent: boolean
    }
    applicantDetails: {
      contactEmailPhone: string
      fullName: string
      postcode: string
      siteAddress: string
    }
    propertyAndOwnership: {
      nearConservationAreaOrListedBuilding: string
      ownershipStatus: string
      propertyType: string
      purposeOfDevelopment: string
    }
  }
  worksAndMaterials: {
    descriptionOfWorks: {
      propsedWorksDescription: string
      existingPropertyWidthM?: number
      distanceFromBoundaryM?: number
      existingPropertyHeightM?: number
      proposedExtensionHeightM?: number
      proposedExtensionWidthM?: number
      ridgeOrEavesHeightM?: number
    }
    materials: {
      colourOrFinishNotes: string
      materialsMatchExisting: string
      roofMaterials: string
      wallMaterials: string
    }
    plansDrawingsPhotographs?: {
      locationPlan?: string
      additionalDrawings?: string
      existingAndProposedElevations?: string
      photographsOfSite?: string
      sitePlan?: string
    }
  }
  siteConstraints: {
    accessAndParking?: {
      accessOrParkingChanges: string
      cycleStorageProvisions: string
      newOrAlteredAccess: string
    }
    floodAndEnvironmentalRisk?: {
      isSiteContaminatedLand: string
      isSiteInFloodRiskArea: string
      floodRiskAssesmentReport?: string
    }
    heritageAndListing?: {
      isInConservationArea: string
      isListedBuilding: string
    }
    preApplicationAdvice?: {
      officerName: string
      preApplicationAdviceSummary: string
      preApplicationReferenceNumber: string
      soughtPreAppAdvice: string
    }
    treesHedgesLandscaping?: {
      treeSpecies: string
      treesWithTPO: string
      treesWithinFallingDistance: string
      treeSurveyReport?: string
    }
  }
  utilitiesAndConsents: {
    additionalConsents: string
    communityConsultation: string
    ownershipCertificate: {
      certificateOfOwnership: string
      ownershipDetails: string
    }
    utilitiesAndWaste: {
      existingWasteArrangements: string
      renewableEnergyDetails: string
      renewableEnergyProposals: string
      sewageOrDrainage: string
      surfaceWaterDrainage: string
      waterSupply: string
    }
  }
  declarations: {
    digitalSignature: {
      signatoryCapacity: string
      signatoryFullName: string
    }
    reviewDeclarations: {
      authorityConfirmed: boolean
      feeAgreementAccepted: boolean
      informationAccurate: boolean
      privateRightsAcknowledged: boolean
      publicDataConsent: boolean
    }
  }
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
    notifyMissingDocsSentToAgentX,
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
  const [showSendAnimation, setShowSendAnimation] = useState(false)
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
  const applicantDetails = eligibilityData?.applicantAndProperty.applicantDetails
  const propertyDetails = eligibilityData?.applicantAndProperty.propertyAndOwnership
  const agentDetails = eligibilityData?.applicantAndProperty.agentDetails
  const worksDetails = eligibilityData?.worksAndMaterials.descriptionOfWorks
  const materialDetails = eligibilityData?.worksAndMaterials.materials
  const planDetails = eligibilityData?.worksAndMaterials.plansDrawingsPhotographs
  const siteConstraints = eligibilityData?.siteConstraints
  const accessAndParking = siteConstraints?.accessAndParking
  const floodAndEnvironmentalRisk = siteConstraints?.floodAndEnvironmentalRisk
  const heritageAndListing = siteConstraints?.heritageAndListing
  const preApplicationAdvice = siteConstraints?.preApplicationAdvice
  const treesHedgesLandscaping = siteConstraints?.treesHedgesLandscaping
  const utilitiesAndConsents = eligibilityData?.utilitiesAndConsents
  const declarationDetails = eligibilityData?.declarations
  const customer = {
    name: formatDisplayValue(applicantDetails?.fullName),
    phone: formatDisplayValue(applicantDetails?.contactEmailPhone),
    email: "-",
    location: formatDisplayValue(applicantDetails?.siteAddress),
    status: eligibilityData ? formatEligibilityStatus(eligibilityData.status) : "Live Data Pending",
  }
  const formSubmission = {
    applicantName: formatDisplayValue(applicantDetails?.fullName),
    contactEmail: "-",
    contactPhone: formatDisplayValue(applicantDetails?.contactEmailPhone),
    siteAddress: formatDisplayValue(applicantDetails?.siteAddress),
    postcode: formatDisplayValue(applicantDetails?.postcode),
    propertyType: formatDisplayValue(propertyDetails?.propertyType),
    ownershipStatus: formatDisplayValue(propertyDetails?.ownershipStatus),
    conservationArea: formatDisplayValue(heritageAndListing?.isInConservationArea),
    purposeOfDevelopment: formatDisplayValue(propertyDetails?.purposeOfDevelopment),
    existingWidth: formatDisplayValue(worksDetails?.existingPropertyWidthM),
    existingDepth: formatDisplayValue(worksDetails?.distanceFromBoundaryM),
    proposedExtensionDepth: formatDisplayValue(worksDetails?.proposedExtensionWidthM),
    proposedExtensionHeight: formatDisplayValue(worksDetails?.proposedExtensionHeightM),
    externalMaterials: formatDisplayValue(materialDetails?.wallMaterials),
    briefDescription: formatDisplayValue(worksDetails?.propsedWorksDescription),
    listedBuilding: formatDisplayValue(heritageAndListing?.isListedBuilding),
    tpo: formatDisplayValue(treesHedgesLandscaping?.treesWithTPO),
    floodZone: formatDisplayValue(floodAndEnvironmentalRisk?.isSiteInFloodRiskArea),
    vehicleAccess: formatDisplayValue(accessAndParking?.newOrAlteredAccess),
    preApplicationAdvice: formatDisplayValue(preApplicationAdvice?.soughtPreAppAdvice),
    additionalConsents: formatDisplayValue(utilitiesAndConsents?.additionalConsents),
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
    clientName: formatDisplayValue(applicantDetails?.fullName),
    title: `Project ${projectId ?? "Unknown"}`,
    description: eligibilityData
      ? "Live project details derived from the connected eligibility record."
      : "No live project metadata connected yet.",
    service: formatDisplayValue(propertyDetails?.purposeOfDevelopment),
    serviceType: formatDisplayValue(propertyDetails?.propertyType),
    serviceNo: "-",
    stage: activeRoadmapStage?.label ?? "Unknown",
    location: formatDisplayValue(applicantDetails?.siteAddress),
    postcode: formatDisplayValue(applicantDetails?.postcode),
    status: eligibilityData?.status ?? "live_data_pending",
    createdDate: eligibilityData?.createdAt ?? "",
    updatedDate: eligibilityData?.updatedAt ?? "",
    agentX: "-",
    agentY: "-",
    architect: "-",
    progress: eligibilityData?.completionStatus.percentage ?? 0,
    estimatedCompletionDate: eligibilityData?.updatedAt ?? "",
    councilReference: "-",
    councilName: "-",
    timeline: "-",
  }
  const requirements = {
    propertyType: formatDisplayValue(propertyDetails?.propertyType),
    locationType: formatDisplayValue(applicantDetails?.siteAddress),
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
                        <InfoPair label="Applicant" value={applicantDetails?.fullName} />
                        <InfoPair label="Contact" value={applicantDetails?.contactEmailPhone} />
                        <InfoPair label="Site Address" value={applicantDetails?.siteAddress} />
                        <InfoPair label="Postcode" value={applicantDetails?.postcode} />
                      </div>
                    </OverviewCard>
                    <OverviewCard title="Property Details" icon={<Home size={14} className="text-emerald-600" />}>
                      <div className="space-y-2">
                        <InfoPair label="Property Type" value={propertyDetails?.propertyType} />
                        <InfoPair label="Ownership" value={propertyDetails?.ownershipStatus} />
                        <InfoPair label="Purpose" value={propertyDetails?.purposeOfDevelopment} />
                        <InfoPair
                          label="Near Conservation / Listed"
                          value={propertyDetails?.nearConservationAreaOrListedBuilding}
                        />
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
                        <InfoPair label="Existing Width (m)" value={worksDetails?.existingPropertyWidthM} />
                        <InfoPair label="Existing Height (m)" value={worksDetails?.existingPropertyHeightM} />
                        <InfoPair label="Proposed Width (m)" value={worksDetails?.proposedExtensionWidthM} />
                        <InfoPair label="Proposed Height (m)" value={worksDetails?.proposedExtensionHeightM} />
                        <InfoPair label="Distance From Boundary (m)" value={worksDetails?.distanceFromBoundaryM} />
                        <InfoPair label="Ridge / Eaves Height (m)" value={worksDetails?.ridgeOrEavesHeightM} />
                      </div>
                    </OverviewCard>
                    <OverviewCard title="Materials + Drawings" icon={<Building2 size={14} className="text-amber-600" />}>
                      <div className="space-y-2">
                        <InfoPair label="Works Description" value={worksDetails?.propsedWorksDescription} />
                        <InfoPair label="Wall Materials" value={materialDetails?.wallMaterials} />
                        <InfoPair label="Roof Materials" value={materialDetails?.roofMaterials} />
                        <InfoPair label="Match Existing" value={materialDetails?.materialsMatchExisting} />
                        <InfoPair label="Colour Notes" value={materialDetails?.colourOrFinishNotes} />
                        {planDetails?.locationPlan ? (
                          <a
                            href={planDetails.locationPlan}
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
                        <InfoPair label="Listed Building" value={heritageAndListing?.isListedBuilding} />
                        <InfoPair label="Conservation Area" value={heritageAndListing?.isInConservationArea} />
                        <InfoPair label="Flood Risk Area" value={floodAndEnvironmentalRisk?.isSiteInFloodRiskArea} />
                        <InfoPair label="Contaminated Land" value={floodAndEnvironmentalRisk?.isSiteContaminatedLand} />
                        <InfoPair label="New / Altered Access" value={accessAndParking?.newOrAlteredAccess} />
                        <InfoPair label="Access / Parking Changes" value={accessAndParking?.accessOrParkingChanges} />
                        <InfoPair label="Cycle Storage" value={accessAndParking?.cycleStorageProvisions} />
                      </div>
                    </OverviewCard>
                    <OverviewCard title="Trees + Consents" icon={<TreePine size={14} className="text-emerald-600" />}>
                      <div className="space-y-2">
                        <InfoPair label="Pre-App Advice Sought" value={preApplicationAdvice?.soughtPreAppAdvice} />
                        <InfoPair label="Pre-App Ref" value={preApplicationAdvice?.preApplicationReferenceNumber} />
                        <InfoPair label="Trees with TPO" value={treesHedgesLandscaping?.treesWithTPO} />
                        <InfoPair label="Tree Species" value={treesHedgesLandscaping?.treeSpecies} />
                        <InfoPair label="Trees Within Falling Distance" value={treesHedgesLandscaping?.treesWithinFallingDistance} />
                        <InfoPair label="Additional Consents" value={utilitiesAndConsents?.additionalConsents} />
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
                        <div className="grid md:grid-cols-2 gap-4">
                          <OverviewCard
                            title="Applicant + Property"
                            icon={<Home size={14} className="text-blue-600" />}
                          >
                            <div className="space-y-2 text-sm text-slate-700">
                              <InfoPair label="Applicant" value={eligibilityData.applicantAndProperty.applicantDetails.fullName} />
                              <InfoPair label="Contact" value={eligibilityData.applicantAndProperty.applicantDetails.contactEmailPhone} />
                              <InfoPair label="Site Address" value={eligibilityData.applicantAndProperty.applicantDetails.siteAddress} />
                              <InfoPair label="Postcode" value={eligibilityData.applicantAndProperty.applicantDetails.postcode} />
                              <InfoPair label="Property Type" value={eligibilityData.applicantAndProperty.propertyAndOwnership.propertyType} />
                              <InfoPair label="Ownership" value={eligibilityData.applicantAndProperty.propertyAndOwnership.ownershipStatus} />
                              <InfoPair label="Purpose" value={eligibilityData.applicantAndProperty.propertyAndOwnership.purposeOfDevelopment} />
                              <InfoPair
                                label="Near Conservation / Listed"
                                value={eligibilityData.applicantAndProperty.propertyAndOwnership.nearConservationAreaOrListedBuilding}
                              />
                              <InfoPair
                                label="Uses Planning Agent"
                                value={eligibilityData.applicantAndProperty.agentDetails.usesPlanningAgent}
                              />
                              <InfoPair label="Agent Name" value={eligibilityData.applicantAndProperty.agentDetails.agentName} />
                              <InfoPair
                                label="Agent Contact"
                                value={eligibilityData.applicantAndProperty.agentDetails.agentContactEmailPhone}
                              />
                              <InfoPair
                                label="Agent Address"
                                value={eligibilityData.applicantAndProperty.agentDetails.agentAddress}
                              />
                            </div>
                          </OverviewCard>

                          <OverviewCard
                            title="Works + Materials"
                            icon={<Ruler size={14} className="text-indigo-600" />}
                          >
                            <div className="space-y-2 text-sm text-slate-700">
                              <InfoPair
                                label="Works Description"
                                value={eligibilityData.worksAndMaterials.descriptionOfWorks.propsedWorksDescription}
                              />
                              <InfoPair label="Wall Materials" value={eligibilityData.worksAndMaterials.materials.wallMaterials} />
                              <InfoPair label="Roof Materials" value={eligibilityData.worksAndMaterials.materials.roofMaterials} />
                              <InfoPair label="Match Existing" value={eligibilityData.worksAndMaterials.materials.materialsMatchExisting} />
                              <InfoPair label="Colour Notes" value={eligibilityData.worksAndMaterials.materials.colourOrFinishNotes} />
                              <InfoPair
                                label="Existing Width (m)"
                                value={eligibilityData.worksAndMaterials.descriptionOfWorks.existingPropertyWidthM}
                              />
                              <InfoPair
                                label="Existing Height (m)"
                                value={eligibilityData.worksAndMaterials.descriptionOfWorks.existingPropertyHeightM}
                              />
                              <InfoPair
                                label="Proposed Width (m)"
                                value={eligibilityData.worksAndMaterials.descriptionOfWorks.proposedExtensionWidthM}
                              />
                              <InfoPair
                                label="Proposed Height (m)"
                                value={eligibilityData.worksAndMaterials.descriptionOfWorks.proposedExtensionHeightM}
                              />
                              <InfoPair
                                label="Distance From Boundary (m)"
                                value={eligibilityData.worksAndMaterials.descriptionOfWorks.distanceFromBoundaryM}
                              />
                              <InfoPair
                                label="Ridge / Eaves Height (m)"
                                value={eligibilityData.worksAndMaterials.descriptionOfWorks.ridgeOrEavesHeightM}
                              />
                              {eligibilityData.worksAndMaterials.plansDrawingsPhotographs?.locationPlan ? (
                                <a
                                  href={eligibilityData.worksAndMaterials.plansDrawingsPhotographs.locationPlan}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={14} />
                                  Open location plan
                                </a>
                              ) : null}
                              {eligibilityData.worksAndMaterials.plansDrawingsPhotographs?.sitePlan ? (
                                <a
                                  href={eligibilityData.worksAndMaterials.plansDrawingsPhotographs.sitePlan}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={14} />
                                  Open site plan
                                </a>
                              ) : null}
                              {eligibilityData.worksAndMaterials.plansDrawingsPhotographs?.existingAndProposedElevations ? (
                                <a
                                  href={eligibilityData.worksAndMaterials.plansDrawingsPhotographs.existingAndProposedElevations}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={14} />
                                  Open elevations
                                </a>
                              ) : null}
                              {eligibilityData.worksAndMaterials.plansDrawingsPhotographs?.additionalDrawings ? (
                                <a
                                  href={eligibilityData.worksAndMaterials.plansDrawingsPhotographs.additionalDrawings}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={14} />
                                  Open additional drawings
                                </a>
                              ) : null}
                              {eligibilityData.worksAndMaterials.plansDrawingsPhotographs?.photographsOfSite ? (
                                <a
                                  href={eligibilityData.worksAndMaterials.plansDrawingsPhotographs.photographsOfSite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={14} />
                                  Open site photographs
                                </a>
                              ) : null}
                            </div>
                          </OverviewCard>

                          <OverviewCard
                            title="Site Constraints"
                            icon={<Shield size={14} className="text-amber-600" />}
                          >
                            <div className="space-y-2 text-sm text-slate-700">
                              <InfoPair label="Listed Building" value={heritageAndListing?.isListedBuilding} />
                              <InfoPair label="Conservation Area" value={heritageAndListing?.isInConservationArea} />
                              <InfoPair label="Flood Risk Area" value={floodAndEnvironmentalRisk?.isSiteInFloodRiskArea} />
                              <InfoPair label="Contaminated Land" value={floodAndEnvironmentalRisk?.isSiteContaminatedLand} />
                              <InfoPair label="New or Altered Access" value={accessAndParking?.newOrAlteredAccess} />
                              <InfoPair label="Parking Changes" value={accessAndParking?.accessOrParkingChanges} />
                              <InfoPair label="Cycle Storage" value={accessAndParking?.cycleStorageProvisions} />
                              <InfoPair label="Pre-App Advice Sought" value={preApplicationAdvice?.soughtPreAppAdvice} />
                              <InfoPair label="Officer Name" value={preApplicationAdvice?.officerName} />
                              <InfoPair
                                label="Pre-App Reference"
                                value={preApplicationAdvice?.preApplicationReferenceNumber}
                              />
                              <InfoPair
                                label="Pre-App Summary"
                                value={preApplicationAdvice?.preApplicationAdviceSummary}
                              />
                              <InfoPair label="Trees with TPO" value={treesHedgesLandscaping?.treesWithTPO} />
                              <InfoPair label="Tree Species" value={treesHedgesLandscaping?.treeSpecies} />
                              <InfoPair
                                label="Trees Within Falling Distance"
                                value={treesHedgesLandscaping?.treesWithinFallingDistance}
                              />
                              {floodAndEnvironmentalRisk?.floodRiskAssesmentReport ? (
                                <a
                                  href={floodAndEnvironmentalRisk.floodRiskAssesmentReport}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={14} />
                                  Open flood risk assessment
                                </a>
                              ) : null}
                              {treesHedgesLandscaping?.treeSurveyReport ? (
                                <a
                                  href={treesHedgesLandscaping.treeSurveyReport}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={14} />
                                  Open tree survey report
                                </a>
                              ) : null}
                            </div>
                          </OverviewCard>

                          <OverviewCard
                            title="Utilities + Consents"
                            icon={<Droplets size={14} className="text-emerald-600" />}
                          >
                            <div className="space-y-2 text-sm text-slate-700">
                              <InfoPair label="Additional Consents" value={eligibilityData.utilitiesAndConsents.additionalConsents} />
                              <InfoPair label="Community Consultation" value={eligibilityData.utilitiesAndConsents.communityConsultation} />
                              <InfoPair label="Water Supply" value={eligibilityData.utilitiesAndConsents.utilitiesAndWaste.waterSupply} />
                              <InfoPair label="Drainage" value={eligibilityData.utilitiesAndConsents.utilitiesAndWaste.sewageOrDrainage} />
                              <InfoPair label="Surface Water Drainage" value={eligibilityData.utilitiesAndConsents.utilitiesAndWaste.surfaceWaterDrainage} />
                              <InfoPair label="Renewable Energy" value={eligibilityData.utilitiesAndConsents.utilitiesAndWaste.renewableEnergyProposals} />
                              <InfoPair
                                label="Renewable Energy Details"
                                value={eligibilityData.utilitiesAndConsents.utilitiesAndWaste.renewableEnergyDetails}
                              />
                              <InfoPair
                                label="Existing Waste Arrangements"
                                value={eligibilityData.utilitiesAndConsents.utilitiesAndWaste.existingWasteArrangements}
                              />
                              <InfoPair
                                label="Ownership Certificate"
                                value={eligibilityData.utilitiesAndConsents.ownershipCertificate.certificateOfOwnership}
                              />
                              <InfoPair
                                label="Ownership Details"
                                value={eligibilityData.utilitiesAndConsents.ownershipCertificate.ownershipDetails}
                              />
                            </div>
                          </OverviewCard>

                          <OverviewCard
                            title="Declaration"
                            icon={<BadgeCheck size={14} className="text-blue-600" />}
                          >
                            <div className="space-y-2 text-sm text-slate-700">
                              <InfoPair
                                label="Signatory Capacity"
                                value={eligibilityData.declarations.digitalSignature.signatoryCapacity}
                              />
                              <InfoPair
                                label="Signatory Name"
                                value={eligibilityData.declarations.digitalSignature.signatoryFullName}
                              />
                              <InfoPair
                                label="Authority Confirmed"
                                value={eligibilityData.declarations.reviewDeclarations.authorityConfirmed}
                              />
                              <InfoPair
                                label="Fee Agreement Accepted"
                                value={eligibilityData.declarations.reviewDeclarations.feeAgreementAccepted}
                              />
                              <InfoPair
                                label="Information Accurate"
                                value={eligibilityData.declarations.reviewDeclarations.informationAccurate}
                              />
                              <InfoPair
                                label="Private Rights Acknowledged"
                                value={eligibilityData.declarations.reviewDeclarations.privateRightsAcknowledged}
                              />
                              <InfoPair
                                label="Public Data Consent"
                                value={eligibilityData.declarations.reviewDeclarations.publicDataConsent}
                              />
                            </div>
                          </OverviewCard>
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
                        <span className="text-slate-500">Existing</span>
                        <span className="font-semibold text-slate-800">{formSubmission.existingWidth}m x {formSubmission.existingDepth}m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Proposed</span>
                        <span className="font-semibold text-blue-800">{formSubmission.proposedExtensionDepth} x {formSubmission.proposedExtensionHeight}</span>
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

function DetailCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${
      highlight ? "bg-blue-50 border-blue-200" : "bg-slate-50"
    }`}>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-sm font-semibold ${
        highlight ? "text-blue-900" : "text-slate-800"
      }`}>
        {value}
      </p>
    </div>
  )
}

function DimensionRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
      highlight ? "bg-blue-100" : "bg-white border"
    }`}>
      <span className={`text-sm ${
        highlight ? "text-blue-900 font-semibold" : "text-slate-600"
      }`}>
        {label}
      </span>
      <span className={`text-sm font-bold ${
        highlight ? "text-blue-900" : "text-slate-900"
      }`}>
        {value}
      </span>
    </div>
  )
}

function ConstraintCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: "green" | "blue" | "red"
}) {
  const colors = {
    green: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      text: "text-emerald-900",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-900",
    },
    red: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      icon: "text-rose-600",
      text: "text-rose-900",
    },
  }

  const style = colors[color]

  return (
    <div className={`rounded-xl border ${style.bg} ${style.border} px-4 py-3`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={style.icon}>{icon}</span>
        <p className={`text-xs font-semibold ${style.text}`}>{label}</p>
      </div>
      <p className={`text-sm font-bold ${style.text}`}>{value}</p>
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


