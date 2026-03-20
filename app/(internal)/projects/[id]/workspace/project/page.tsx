"use client"
import CustomerJourney from "@/components/CustomerJourney"
import Link from "next/link"
import SendToAgentAnimation from "@/components/SendToAgentAnimation"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
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
  customer,
  formSubmission,
  getMockWorkspaceRoadmap,
  project,
  quote,
  requirements,
  workspaceRoadmapMockResponse,
} from "./workspaceData"
import type {
  WorkspaceRoadmapResponse,
  WorkspaceRoadmapStage,
  WorkspaceSectionId as SectionId,
} from "./workspaceData"






interface CoordinationTask {
  id: string
  title: string
  owner: "client" | "agentY" | "agentX"
  due: string
  priority: "high" | "medium" | "low"
  done: boolean
}

const INITIAL_COORDINATION_TASKS: CoordinationTask[] = [
  {
    id: "task-1",
    title: "Receive missing document request from Agent Y",
    owner: "agentY",
    due: "Today",
    priority: "high",
    done: true,
  },
  {
    id: "task-2",
    title: "Request required documents from customer",
    owner: "agentX",
    due: "Tomorrow",
    priority: "high",
    done: false,
  },
  {
    id: "task-3",
    title: "Validate uploaded customer documents and pass to Agent Y",
    owner: "agentX",
    due: "In 2 days",
    priority: "medium",
    done: false,
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
  const [coordinationTasks, setCoordinationTasks] = useState<CoordinationTask[]>(
    INITIAL_COORDINATION_TASKS
  )
  const [roadmap, setRoadmap] = useState<WorkspaceRoadmapResponse>(
    workspaceRoadmapMockResponse
  )
  const [currentStageId, setCurrentStageId] = useState(
    workspaceRoadmapMockResponse.currentStageId
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
      const response = await getMockWorkspaceRoadmap()
      if (!active) return
      setRoadmap(response)
    }

    void loadRoadmap()

    return () => {
      active = false
    }
  }, [])

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

  const toggleCoordinationTask = (taskId: string) => {
    setCoordinationTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    )
  }

  const progressValue =
    roadmapStages.length > 1
      ? Math.round((currentStep / (roadmapStages.length - 1)) * 100)
      : 0
  const checklistLoaded = documentState.checklist.length > 0
  const requiredChecklistNames = documentState.checklist
    .filter((doc) => doc.required)
    .map((doc) => doc.name)
  const journeySteps = roadmapStages.map((stage) =>
    stage.id === "received-checklist"
      ? {
          ...stage,
          details: requiredChecklistNames,
          desc: !checklistLoaded
            ? "Checklist pending from Agent Y."
            : requiredChecklistNames.length > 0
            ? "Checklist received. Required documents listed below."
            : "Checklist received. No required documents flagged.",
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
                    Project {project.id}
                  </span>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-blue-700">
                    Agent X Workspace
                  </span>
                  
                </div>
              </div>
            </div>

            
            {/* NEW: FORM SUBMISSION DETAILS */}
            {activeSection === "submission" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <FileCheck size={18} className="text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Application Form Submission
                  </h2>
                </div>

                {/* Submission Header */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-5 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">
                        Planning Application Details
                      </h3>
                      <p className="text-sm text-slate-600">
                        Form completed with all required information
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      Submitted
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Home size={14} className="text-blue-600" />
                    Property Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <DetailCard label="Applicant Name" value={formSubmission.applicantName} />
                    <DetailCard label="Property Type" value={formSubmission.propertyType} />
                    <DetailCard label="Site Address" value={formSubmission.siteAddress} />
                    <DetailCard label="Postcode" value={formSubmission.postcode} />
                    <DetailCard label="Ownership Status" value={formSubmission.ownershipStatus} />
                    <DetailCard 
                      label="Purpose" 
                      value={formSubmission.purposeOfDevelopment}
                      highlight
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Mail size={14} className="text-rose-600" />
                    Contact Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <DetailCard label="Email" value={formSubmission.contactEmail} />
                    <DetailCard label="Phone" value={formSubmission.contactPhone} />
                  </div>
                </div>

                {/* Conservation Status */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900 mb-2">
                        Conservation Area Status
                      </p>
                      <p className="text-sm text-blue-800">
                        <span className="font-bold">{formSubmission.conservationArea === "No" ? "Not in" : "Within"}</span> a conservation area or listed building
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW: DIMENSIONS SECTION */}
            {activeSection === "dimensions" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Ruler size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Project Dimensions
                  </h2>
                </div>

                {/* Visual comparison */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Existing */}
                    <div>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                        Existing Property
                      </p>
                      <div className="space-y-2">
                        <DimensionRow label="Width" value={formSubmission.existingWidth} />
                        <DimensionRow label="Depth" value={formSubmission.existingDepth} />
                      </div>
                    </div>

                    {/* Proposed */}
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                        Proposed Extension
                      </p>
                      <div className="space-y-2">
                        <DimensionRow label="Extension Depth" value={formSubmission.proposedExtensionDepth} highlight />
                        <DimensionRow label="Extension Height" value={formSubmission.proposedExtensionHeight} highlight />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Materials */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Building2 size={14} className="text-amber-600" />
                    External Materials
                  </h3>
                  <div className="rounded-xl border bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-900">
                      {formSubmission.externalMaterials}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Project Description
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {formSubmission.briefDescription}
                  </p>
                </div>
              </div>
            )}

            {/* NEW: CONSTRAINTS SECTION */}
            {activeSection === "constraints" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Shield size={18} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Planning Constraints
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <ConstraintCard
                    icon={<TreePine size={16} />}
                    label="Listed Building"
                    value={formSubmission.listedBuilding}
                    color="green"
                  />
                  <ConstraintCard
                    icon={<TreePine size={16} />}
                    label="Tree Preservation Order (TPO)"
                    value={formSubmission.tpo}
                    color="green"
                  />
                  <ConstraintCard
                    icon={<Droplets size={16} />}
                    label="Flood Zone"
                    value={formSubmission.floodZone}
                    color="green"
                  />
                  <ConstraintCard
                    icon={<Car size={16} />}
                    label="Vehicle Access"
                    value={formSubmission.vehicleAccess}
                    color="blue"
                  />
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <div className="rounded-xl border bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        Pre-application Advice Sought
                      </p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        formSubmission.preApplicationAdvice === "Yes" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {formSubmission.preApplicationAdvice}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        Additional Consents Required
                      </p>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {formSubmission.additionalConsents}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">
                        Constraint Assessment Complete
                      </p>
                      <p className="text-sm text-slate-600">
                        No major planning constraints identified. Project eligible to proceed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW: CONSULTATION SECTION */}
            {activeSection === "consultation" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Video size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Consultation Booking
                  </h2>
                </div>

                {formSubmission.consultationBooked ? (
                  <>
                    {/* Booking Confirmed */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm opacity-90 mb-1">
                            {formSubmission.consultationType}
                          </p>
                          <h3 className="text-xl font-bold">
                            Consultation Confirmed
                          </h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                          Scheduled
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} />
                        <span>{formSubmission.consultationDuration}</span>
                      </div>
                    </div>

                    {/* Consultant Profile */}
                    <div className="bg-white rounded-xl border p-5 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {formSubmission.consultant.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-900 mb-1">
                            {formSubmission.consultant}
                          </h4>
                          <p className="text-sm text-slate-600 mb-3">
                            {formSubmission.consultantTitle}
                          </p>
                          <div className="flex items-center gap-2">
                            <BadgeCheck size={14} className="text-blue-600" />
                            <span className="text-xs text-slate-500">
                              Verified Planning Expert
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 rounded-xl border bg-slate-50 px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Calendar size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-0.5">Date</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formSubmission.consultationDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-xl border bg-slate-50 px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Clock size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-0.5">Time</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formSubmission.consultationTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-xl border bg-slate-50 px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Video size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-0.5">Format</p>
                          <p className="text-sm font-semibold text-slate-900">
                            Video Call (15 minutes)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <Video size={16} />
                        Join Video Call
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Video size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No consultation scheduled</p>
                  </div>
                )}
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
                  <div className="rounded-xl border bg-blue-50 p-5">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                      Client Side
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-800">
                        <span className="font-semibold">Primary Contact:</span> {customer.name}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Requested Docs:</span> Proof of ownership, recent utility bill, signed consent form
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Pending from Client:</span> Upload signed consent form (PDF) and boundary photo
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-amber-50 p-5">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3">
                      Agent Y Side
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-800">
                        <span className="font-semibold">Assigned Agent Y:</span> {project.agentY}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Current Need:</span> Missing supporting documents for planning package
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Pending from Agent Y:</span> Final review after Agent X shares verified files
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-900">
                      Document Mediation Action Queue
                    </p>
                    <p className="text-xs text-slate-500">
                      {coordinationTasks.filter((task) => task.done).length}/{coordinationTasks.length} completed
                    </p>
                  </div>

                  <div className="space-y-3">
                    {coordinationTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
                          task.done ? "bg-emerald-50 border-emerald-200" : "bg-slate-50"
                        }`}
                      >
                        <button
                          onClick={() => toggleCoordinationTask(task.id)}
                          className={`mt-0.5 h-5 w-5 rounded-full border grid place-items-center transition-colors ${
                            task.done
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 text-transparent hover:border-blue-500"
                          }`}
                          aria-label="Toggle task status"
                        >
                          <CheckCircle size={12} />
                        </button>

                        <div className="flex-1">
                          <p className={`text-sm font-medium ${task.done ? "text-emerald-900 line-through" : "text-slate-800"}`}>
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                            <span className="rounded-full bg-white border px-2 py-0.5 text-slate-600">
                              Owner: {task.owner}
                            </span>
                            <span className="rounded-full bg-white border px-2 py-0.5 text-slate-600">
                              Due: {task.due}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 font-semibold ${
                                task.priority === "high"
                                  ? "bg-rose-100 text-rose-700"
                                  : task.priority === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {task.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    value={new Date(project.createdDate).toLocaleDateString()}
                  />
                  <MetaBox
                    icon={<Calendar size={14} className="text-amber-500" />}
                    label="Est. Completion"
                    value={new Date(project.estimatedCompletionDate).toLocaleDateString()}
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
                <MaskField label="Property Address" value="Springfield, IL 62704" />
                <MaskField label="Email Correspondence" value="c****@domain.com" />
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
              <p className="flex items-center gap-2 text-slate-700">
                <CheckCircle size={14} className="text-emerald-500" />
                CIL Form
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <CheckCircle size={14} className="text-emerald-500" />
                Location Plan
              </p>
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


