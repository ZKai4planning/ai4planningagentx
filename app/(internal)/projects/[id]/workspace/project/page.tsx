

"use client"
import CustomerJourney, { type JourneyStep } from "@/components/CustomerJourney"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react"
import axiosInstance from "@/lib/axiosinstance"
import jsPDF from "jspdf";
import {
  eligibilityFieldMappings,
  getEligibilityApplicantName,
  getEligibilityFieldValue,
  getEligibilityResourceValue,
  getEligibilitySiteAddress,
  getFirstMappedValue,
} from "@/lib/eligibility"
import { useDocumentMediation, type ChecklistDoc } from "../documents/store"
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
  Info,
  FileCheck,
  Video,
  Bot,
  Headphones,
  History,
  Download,
  Pencil,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import EligibilityDetailsCard, {
  CHECKLIST_COMPLIANCE,
  CHECKLIST_DOCUMENTS,
  CHECKLIST_DRAWINGS,
} from "./components/EligibilityDetailsCard"
import {
  defaultWorkspaceRoadmap,
  getWorkspaceRoadmap,
} from "./workspaceData"
import type {
  WorkspaceRoadmapResponse,
  WorkspaceRoadmapStage,
  WorkspaceSectionId as SectionId,
} from "./workspaceData"
import { Trash2 } from "lucide-react";

// ... [Type definitions] ...
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

type ApplicationUser = {
  userId?: string
  fullName?: string
  email?: string
  phoneNumber?: string
}

type ApplicationProject = Record<string, unknown> & {
  projectId: string
  userId?: string
  user?: ApplicationUser | null
}

type ApplicationProjectsResponse = {
  success?: boolean
  message?: string
  data?: ApplicationProject[]
}

type ServiceCartItem = {
  serviceItemId: string
  serviceName?: string
  payment?: number
}

type ServiceCartData = {
  cartId: string
  projectId: string
  userId: string
  totalServices?: number
  totalPayment?: number
  services?: ServiceCartItem[]
  createdAt?: string
  updatedAt?: string
}

type ServiceCartResponse = {
  success?: boolean
  message?: string
  data?: ServiceCartData | {
    projectId?: string
    userId?: string
    totalCarts?: number
    carts?: ServiceCartData[]
  }
}

type ServiceCartUpdatePayload = {
  cartId: string
  userId: string
  notes: string
}

type AddServiceCartPayload = {
  projectId: string
  userId: string
  services: Array<{
    serviceName: string
    payment: number
  }>
}

type UpdateServiceCartItemPayload = {
  serviceName: string
  payment: number
}

type EligibilityFieldKey = keyof typeof eligibilityFieldMappings

type EligibilityRow = {
  key: string
  label: string
  value: string
  kind?: "default" | "block"
}

type ReviewChecklistStatus = "completed" | "in-progress" | "pending"
type FinalReviewChecklistItem = {
  label: string
  status: ReviewChecklistStatus
}

type FinalReviewChecklistGroup = {
  label: string
  items: FinalReviewChecklistItem[]
}

type BriefcaseDocumentItem = {
  id?: string
  label: string
  status: string
  href?: string
  previewHref?: string
  fileName?: string
  fileSize?: string
  fileType?: string
  uploadedAt?: string
  source?: string
  note?: string
  group?: string
  surveyDate?: string
  surveyTime?: string
  surveyLocation?: string
}

type QuoteService = {
  id: string;
  title: string;
  category: string;
  amount: string;
  about: string;
  status: string;
};

type GeneratedQuote = {
  id: string;
  clientName: string;
  amount: string;
  status: "Draft" | "Sent";
  createdAt: string;
  services: QuoteService[];
};

type GeneratedQuotationRecord = Record<string, unknown> & {
  quotationId?: string
  cartId?: string
  totalPayment?: number
  totalAmount?: number
  amount?: number
  status?: string
  createdAt?: string
  updatedAt?: string
  services?: ServiceCartItem[]
}

type GeneratedQuotationsResponse = {
  success?: boolean
  message?: string
  data?: GeneratedQuotationRecord[] | {
    quotations?: GeneratedQuotationRecord[]
    items?: GeneratedQuotationRecord[]
  }
}

// ... [Helper functions] ...
const longEligibilityFieldKeys = new Set<EligibilityFieldKey>([
  "previousProposalDetails",
  "projectComparison",
  "proposedWorksDescription",
  "preApplicationAdviceSummary",
  "ownershipDetails",
  "agentAddress",
])

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

const eligibilityReviewBrief =
  "Hi Agent X, Customer has selected the Mandatory HMO Licence service for London Borough of Newham Council. Please review and verify all applicable Newham HMO licensing regulations, property compliance standards, and statutory requirements, including occupancy limits, minimum room sizes, fire safety measures, amenity provisions, waste management, and landlord fit-and-proper person criteria. Ensure the property is assessed against current council standards before progressing with the licence application."

const roadmapDocumentActions = [
  { label: "Awaiting from Customer", value: "awaiting" },
  { label: "Received Document", value: "received" },
]

const agentZTriggerHeadlines = new Set([
  "PLANNING TRIGGERS",
  "LICENSING TRIGGERS (MANDATORY HMO LICENCE)",
  "BUILDING CONTROL TRIGGERS",
  "BEDROOM SIZE REQUIREMENTS (NEWHAM)",
  "COMMUNAL SPACE (KITCHEN ONLY)",
  "COMMUNAL SPACE (KITCHEN + SEPARATE LIVING ROOM)",
  "OPEN-PLAN KITCHEN / LOUNGE",
  "REPORTS & SURVEYS",
  "COMPLIANCE CERTIFICATES",
])

function getInitialSection(sectionParam: string | null): SectionId {
  if (sectionParam === "communication" || sectionParam === "chat") return "communication"
  if (sectionParam === "documents" || sectionParam === "document") return "documents"
  if (sectionParam === "coordination") return "documents"

  const validSections: SectionId[] = [
    "coordination", "project", "submission", "dimensions", "constraints",
    "consultation", "requirements", "quote", "profile", "payments",
    "notes", "communication", "documents",
  ]

  if (sectionParam && validSections.includes(sectionParam as SectionId)) {
    return sectionParam as SectionId
  }
  return "project"
}

function buildStageWorkspaceUrl(projectId: string, stage: WorkspaceRoadmapStage) {
  const params = new URLSearchParams({ section: stage.opensSection })
  if (stage.queryStep) params.set("step", stage.queryStep)
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
    const items: string[] = value.map((item) => formatDisplayValue(item)).filter((item) => item !== "-")
    return items.length > 0 ? items.join(", ") : "-"
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    const preferredKeys = ["fullAddress", "address", "siteAddress", "label", "name", "value", "title", "description", "text", "postcode"] as const
    for (const key of preferredKeys) {
      const candidate = record[key]
      const formatted: string = formatDisplayValue(candidate)
      if (formatted !== "-") return formatted
    }
    const values: string[] = Object.values(record).map((item) => formatDisplayValue(item)).filter((item) => item !== "-")
    return values.length > 0 ? values.join(", ") : "-"
  }
  return String(value)
}

function formatDateValue(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date)
}

function formatTimeValue(value?: string | null) {
  if (!value) return "-"
  const trimmed = value.trim()
  if (!trimmed) return "-"

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const [hours = "00", minutes = "00"] = trimmed.split(":")
    const normalizedHours = hours.padStart(2, "0")
    return `${normalizedHours}:${minutes}`
  }

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date)
}

function getNestedValue(source: unknown, path: readonly string[]) {
  let current: unknown = source

  for (const key of path) {
    if (!current || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

function getFirstStringValue(source: unknown, candidatePaths: readonly (readonly string[])[]) {
  for (const path of candidatePaths) {
    const value = getNestedValue(source, path)
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return undefined
}

function getScheduleTimestamp(dateTimeValue?: string, dateValue?: string, timeValue?: string) {
  if (dateTimeValue) {
    const timestamp = new Date(dateTimeValue).getTime()
    if (!Number.isNaN(timestamp)) return timestamp
  }

  if (dateValue && timeValue) {
    const timestamp = new Date(`${dateValue} ${timeValue}`).getTime()
    if (!Number.isNaN(timestamp)) return timestamp
  }

  if (dateValue) {
    const timestamp = new Date(dateValue).getTime()
    if (!Number.isNaN(timestamp)) return timestamp
  }

  return null
}

function formatCurrencyGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

function getProjectPaymentStatus(source: unknown): "paid" | "pending" {
  const candidatePaths = [
    ["paymentStatus"],
    ["payment", "status"],
    ["subscription", "paymentStatus"],
    ["user", "paymentStatus"],
    ["customer", "paymentStatus"],
    ["project", "paymentStatus"],
  ] as const

  for (const path of candidatePaths) {
    const value = getNestedValue(source, path)
    if (typeof value !== "string") continue

    const normalized = value.trim().toLowerCase()
    if (["paid", "completed", "success"].includes(normalized)) return "paid"
    if (["pending", "unpaid", "requested", "due"].includes(normalized)) return "pending"
  }

  return "pending"
}

function formatEligibilityStatus(status?: string | null) {
  if (!status) return "Eligibility"
  return status.split("_").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

function hasEligibilityResource(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0
  return true
}

function normalizeChecklistText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function getAnsweredChecklistStatus(value: unknown): ReviewChecklistStatus {
  return formatDisplayValue(value) === "-" ? "pending" : "completed"
}

function getSupportingChecklistStatus(value: unknown): ReviewChecklistStatus {
  return formatDisplayValue(value) === "-" ? "pending" : "in-progress"
}

function getBooleanChecklistStatus(value: boolean): ReviewChecklistStatus {
  return value ? "completed" : "pending"
}

function getPartialChecklistStatus(value: boolean): ReviewChecklistStatus {
  return value ? "in-progress" : "pending"
}

function getDocumentChecklistStatus(doc?: ChecklistDoc): ReviewChecklistStatus {
  if (!doc) return "pending"
  if (doc.customerUpload || doc.agentYUpload || doc.agentXUpload) return "completed"
  if (doc.requestedByAgentX || doc.requestedToAgentY || doc.assignedToAgentY) return "in-progress"
  return "pending"
}

function combineChecklistStatuses(...statuses: ReviewChecklistStatus[]): ReviewChecklistStatus {
  if (statuses.includes("completed")) return "completed"
  if (statuses.includes("in-progress")) return "in-progress"
  return "pending"
}

function findChecklistDocumentByKeywords(docs: ChecklistDoc[], keywords: string[]) {
  const normalizedKeywords = keywords.map(normalizeChecklistText)
  return docs.find((doc) => {
    const normalizedName = normalizeChecklistText(doc.name)
    const normalizedDescription = normalizeChecklistText(doc.description)
    return normalizedKeywords.some((keyword) =>
      normalizedName.includes(keyword) || normalizedDescription.includes(keyword)
    )
  })
}

function getChecklistPreviewMeta(doc?: ChecklistDoc) {
  if (!doc) return {}

  if (doc.customerUpload) {
    return {
      fileName: doc.customerUpload.name,
      uploadedAt: doc.customerUpload.uploadedAt,
      source: "Customer upload",
    }
  }

  if (doc.agentXUpload) {
    return {
      fileName: doc.agentXUpload.name,
      uploadedAt: doc.agentXUpload.uploadedAt,
      source: "Agent X upload",
    }
  }

  if (doc.agentYUpload) {
    return {
      fileName: doc.agentYUpload.name,
      uploadedAt: doc.agentYUpload.uploadedAt,
      source: "Agent Y upload",
    }
  }

  return {
    fileName: doc.name,
    source: doc.requestedByAgentX || doc.requestedToAgentY ? "Request raised" : "No file uploaded yet",
  }
}

function formatEligibilityFieldValue(eligibility: EligibilityData | null, fieldKey: EligibilityFieldKey): string {
  if (!eligibility) return "-"
  const mapping = eligibilityFieldMappings[fieldKey]
  const value = getEligibilityFieldValue(eligibility, fieldKey)
  if (mapping.format === "date") return typeof value === "string" ? formatDateValue(value) : "-"
  return formatDisplayValue(value)
}

function buildEligibilityRows(eligibility: EligibilityData | null, fieldKeys: EligibilityFieldKey[]): EligibilityRow[] {
  if (!eligibility) return []
  return fieldKeys.map((fieldKey) => ({
    key: fieldKey,
    label: eligibilityFieldMappings[fieldKey].label,
    value: formatEligibilityFieldValue(eligibility, fieldKey),
    kind: longEligibilityFieldKeys.has(fieldKey) ? "block" : "default",
  }))
}

function formatDimensionSummary(first: string, second: string) {
  if (first === "-" || second === "-") return "-"
  return `${first}m x ${second}m`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatPaymentAmount(amount?: number | null) {
  const safeAmount = typeof amount === "number" && Number.isFinite(amount) ? amount : 0
  return `${safeAmount} GBP`
}

function getGeneratedQuotationItems(payload?: GeneratedQuotationsResponse["data"]): GeneratedQuotationRecord[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.quotations)) return payload.quotations
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function mapGeneratedQuotationToQuote(
  quotation: GeneratedQuotationRecord,
  fallbackClientName: string
): GeneratedQuote {
  const rawServices = Array.isArray(quotation.services) ? quotation.services : []
  const services: QuoteService[] = rawServices.map((service) => ({
    id: service.serviceItemId,
    title: service.serviceName?.trim() || "Unnamed service",
    category: "Payment Stage",
    amount: formatPaymentAmount(service.payment),
    about: "Service loaded from generated quotation history.",
    status: (service.payment ?? 0) > 0 ? "Ready" : "Pending payment",
  }))

  const totalAmount =
    typeof quotation.totalPayment === "number"
      ? quotation.totalPayment
      : typeof quotation.totalAmount === "number"
      ? quotation.totalAmount
      : typeof quotation.amount === "number"
      ? quotation.amount
      : rawServices.reduce((sum, service) => sum + (service.payment ?? 0), 0)

  const rawStatus = typeof quotation.status === "string" ? quotation.status.toLowerCase() : ""

  return {
    id:
      (typeof quotation.quotationId === "string" && quotation.quotationId) ||
      (typeof quotation.cartId === "string" && quotation.cartId) ||
      `QUOTE-${quotation.createdAt ?? Date.now()}`,
    clientName: fallbackClientName,
    amount: formatPaymentAmount(totalAmount),
    status: rawStatus === "sent" ? "Sent" : "Draft",
    createdAt: quotation.createdAt ?? quotation.updatedAt ?? new Date().toISOString(),
    services,
  }
}

function mapServiceCartToQuoteServices(cart: ServiceCartData | null): QuoteService[] {
  return (cart?.services ?? []).map((service) => ({
    id: service.serviceItemId,
    title: service.serviceName?.trim() || "Unnamed service",
    category: "Payment Stage",
    amount: formatPaymentAmount(service.payment),
    about: "Service loaded from the payment-stage cart.",
    status: (service.payment ?? 0) > 0 ? "Ready" : "Pending payment",
  }))
}

function getLatestServiceCart(data?: ServiceCartResponse["data"]): ServiceCartData | null {
  if (!data) return null

  if (Array.isArray((data as { carts?: ServiceCartData[] }).carts)) {
    const carts = ((data as { carts?: ServiceCartData[] }).carts ?? []).filter(
      (cart): cart is ServiceCartData => Boolean(cart?.cartId)
    )

    if (carts.length === 0) return null

    return [...carts].sort((left, right) => {
      const leftTime = new Date(left.updatedAt ?? left.createdAt ?? 0).getTime()
      const rightTime = new Date(right.updatedAt ?? right.createdAt ?? 0).getTime()
      return rightTime - leftTime
    })[0] ?? null
  }

  return "cartId" in data ? data : null
}

function parsePaymentAmount(amount: string | number | null | undefined): number {
  if (!amount) return 0;

  if (typeof amount === "number") return amount;

  return Number(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
}

function mapQuoteServicesToCartPayloadServices(services: QuoteService[]) {
  return services.map((service) => ({
    serviceName: service.title.trim() || "Unnamed service",
    payment: parsePaymentAmount(service.amount),
  }))
}

function getFileNameFromHref(href?: string) {
  if (!href) return "-"

  try {
    const url = new URL(href)
    const lastSegment = url.pathname.split("/").filter(Boolean).pop()
    return lastSegment ? decodeURIComponent(lastSegment) : href
  } catch {
    const sanitizedHref = href.split("#")[0]?.split("?")[0] ?? href
    const lastSegment = sanitizedHref.split("/").filter(Boolean).pop()
    return lastSegment || href
  }
}

function getFileTypeLabel(fileNameOrHref?: string) {
  if (!fileNameOrHref) return "-"
  const source = fileNameOrHref.includes("/") ? getFileNameFromHref(fileNameOrHref) : fileNameOrHref
  const extension = source.match(/\.[^.]+$/)?.[0]
  return extension?.toLowerCase() ?? "File"
}

function isPdfDocument(fileNameOrHref?: string) {
  return getFileTypeLabel(fileNameOrHref) === ".pdf"
}

function formatFullLocation(address?: string, postcode?: string) {
  const normalizedAddress = (address ?? "").trim()
  const normalizedPostcode = (postcode ?? "").trim()

  if (!normalizedAddress && !normalizedPostcode) return "-"
  if (!normalizedAddress) return normalizedPostcode
  if (!normalizedPostcode) return normalizedAddress
  if (normalizedAddress.toLowerCase().includes(normalizedPostcode.toLowerCase())) return normalizedAddress

  return `${normalizedAddress}, ${normalizedPostcode}`
}

function getPdfPreviewSrc(href: string) {
  if (href.startsWith("blob:")) return href
  return `${href}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`
}

function buildRoadmapWithEligibility(baseRoadmap: WorkspaceRoadmapResponse, eligibility: EligibilityData | null): WorkspaceRoadmapResponse {
  const stages = baseRoadmap.stages.map((stage) =>
    stage.id === "checklist"
      ? { ...stage, desc: eligibility ? "Mandatory HMO licence + planning checklist ready for review." : stage.desc }
      : stage.id === "eligibility-check"
      ? { ...stage, desc: eligibility ? (eligibility.completionStatus.isCompleted ? "Eligibility form completed." : `Eligibility form in progress (${eligibility.completionStatus.percentage}% complete).`) : stage.desc }
      : stage
  )
  return {
    currentStageId: eligibility?.completionStatus.isCompleted ? baseRoadmap.currentStageId : "checklist",
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
  const [notes, setNotes] = useState(["Client confirmed boundary survey booked for 24 Feb."])
  const [activeSection, setActiveSection] = useState<SectionId>(selectedSection)
  const [baseRoadmap, setBaseRoadmap] = useState<WorkspaceRoadmapResponse>(defaultWorkspaceRoadmap)
  const [roadmap, setRoadmap] = useState<WorkspaceRoadmapResponse>(defaultWorkspaceRoadmap)
  const [currentStageId, setCurrentStageId] = useState(defaultWorkspaceRoadmap.currentStageId)
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null)
  const [applicationProject, setApplicationProject] = useState<ApplicationProject | null>(null)
  const [serviceCart, setServiceCart] = useState<ServiceCartData | null>(null)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [addServiceSubmitting, setAddServiceSubmitting] = useState(false)
  const [addServiceError, setAddServiceError] = useState<string | null>(null)
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)
  const [quoteSubmitError, setQuoteSubmitError] = useState<string | null>(null)
  const [councilFeeRows, setCouncilFeeRows] = useState([
    { id: "fee-1", label: "", amount: "" },
  ])

const [councilOfficerReportReceived, setCouncilOfficerReportReceived] = useState<"yes" | "no" | null>(null)
const [councilFeeSubmitting, setCouncilFeeSubmitting] = useState(false)
const [councilFeeSubmitError, setCouncilFeeSubmitError] = useState<string | null>(null)
const [councilFeeSubmitted, setCouncilFeeSubmitted] = useState(false)

  const [eligibilityLoading, setEligibilityLoading] = useState(true)
  const [pendingDocRequest, setPendingDocRequest] = useState(false)
  const [journeyFieldActions, setJourneyFieldActions] = useState<Record<string, string>>({})
  const [briefcaseSent, setBriefcaseSent] = useState({
    documentation: false,
    compliance: false,
    drawings: false,
  })
  
  // Quote State
  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [quotedCartIds, setQuotedCartIds] = useState<string[]>([])
  const [quotationsLoading, setQuotationsLoading] = useState(false)
  const [quoteHistory, setQuoteHistory] = useState<GeneratedQuote[]>([]);
  const [viewingQuote, setViewingQuote] = useState<GeneratedQuote | null>(null);
  const [viewingDocument, setViewingDocument] = useState<BriefcaseDocumentItem | null>(null)
  const [showCouncilSubmissionDialog, setShowCouncilSubmissionDialog] = useState(false)
  const [documentPreviewText, setDocumentPreviewText] = useState("")
  const [documentPreviewLoading, setDocumentPreviewLoading] = useState(false)
  const [documentPreviewError, setDocumentPreviewError] = useState("")
  const [surveyReportUploads, setSurveyReportUploads] = useState<BriefcaseDocumentItem[]>([])
  const surveyUploadInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const roadmapStages = roadmap.stages
  const currentStepIndex = roadmapStages.findIndex((stage) => stage.id === currentStageId)
  const currentStep = currentStepIndex >= 0 ? currentStepIndex : 0
  const activeRoadmapStage = roadmapStages[currentStep]
  const resolvedProjectUserId =
    applicationProject?.userId?.trim() ||
    applicationProject?.user?.userId?.trim() ||
    null
  const applicationApplicantName = applicationProject?.user?.fullName?.trim()
    ? applicationProject.user.fullName.trim()
    : formatDisplayValue(applicationProject?.user?.email)

  // ... [useEffects] ...
  useEffect(() => {
    let active = true
    const loadRoadmap = async () => {
      const response = await getWorkspaceRoadmap()
      if (!active) return
      setBaseRoadmap(response)
    }
    void loadRoadmap()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    const loadEligibility = async () => {
      if (!projectId) { setEligibilityLoading(false); return }
      setEligibilityLoading(true)
      try {
        const response = await axiosInstance.get<EligibilityResponse>(`/eligibility/${encodeURIComponent(projectId)}`)
        if (!active) return
        setEligibilityData(response.data.data ?? null)
      } catch {
        if (!active) return
        setEligibilityData(null)
      } finally {
        if (active) setEligibilityLoading(false)
      }
    }
    void loadEligibility()
    return () => { active = false }
  }, [projectId])

  useEffect(() => {
    let active = true

    const loadApplicationProject = async () => {
      if (!projectId) {
        setApplicationProject(null)
        return
      }

      try {
        const response = await axiosInstance.get<ApplicationProjectsResponse>("/projects/all", {
          params: {
            page: 1,
            limit: 50,
            isDeleted: false,
            search: projectId,
          },
        })

        if (!active) return

        const matchedProject =
          (response.data.data ?? []).find((project) => project.projectId === projectId) ?? null

        setApplicationProject(matchedProject)
      } catch {
        if (!active) return
        setApplicationProject(null)
      }
    }

    void loadApplicationProject()
    return () => { active = false }
  }, [projectId])

  const loadGeneratedQuotations = useCallback(async () => {
    if (!projectId || !resolvedProjectUserId) {
      setQuotedCartIds([])
      setQuoteHistory([])
      setQuoteGenerated(false)
      setQuotationsLoading(false)
      return
    }

    setQuotationsLoading(true)

    try {
      const response = await axiosInstance.get<GeneratedQuotationsResponse>(
        `/service-cart/${encodeURIComponent(projectId)}/quotations`,
        {
          params: {
            projectId,
            userId: resolvedProjectUserId,
          },
        }
      )

      const quotationItems = getGeneratedQuotationItems(response.data.data)
      const nextQuotedCartIds = quotationItems
        .map((quotation) => (typeof quotation.cartId === "string" ? quotation.cartId : null))
        .filter((cartId): cartId is string => Boolean(cartId))
      const currentCartHasGeneratedQuote = serviceCart?.cartId
        ? nextQuotedCartIds.includes(serviceCart.cartId)
        : false

      const generatedQuotes = quotationItems
        .map((quotation) =>
          mapGeneratedQuotationToQuote(
            quotation,
            applicationApplicantName !== "-" ? applicationApplicantName : "Customer"
          )
        )
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())

      setQuotedCartIds(nextQuotedCartIds)
      setQuoteHistory(generatedQuotes)
      setQuoteGenerated(currentCartHasGeneratedQuote)

      if (currentCartHasGeneratedQuote) {
        setQuoteServices([])
        setCartError(null)
        setAddServiceError(null)
      }
    } catch (error) {
      console.error("Failed to load generated quotations", error)
      setQuotedCartIds([])
      setQuoteHistory([])
      setQuoteGenerated(false)
    } finally {
      setQuotationsLoading(false)
    }
  }, [applicationApplicantName, projectId, resolvedProjectUserId, serviceCart?.cartId])

  useEffect(() => {
    void loadGeneratedQuotations()
  }, [loadGeneratedQuotations])

  useEffect(() => { setRoadmap(buildRoadmapWithEligibility(baseRoadmap, eligibilityData)) }, [baseRoadmap, eligibilityData])
  useEffect(() => { setActiveSection(selectedSection) }, [selectedSection])
  useEffect(() => {
    const currentStageExists = roadmapStages.some((stage) => stage.id === currentStageId)
    if (!currentStageExists) setCurrentStageId(roadmap.currentStageId)
  }, [currentStageId, roadmap.currentStageId, roadmapStages])

  useEffect(() => {
    let active = true
    const previewHref = viewingDocument?.previewHref

    if (!previewHref || !previewHref.endsWith(".txt")) {
      setDocumentPreviewText("")
      setDocumentPreviewLoading(false)
      setDocumentPreviewError("")
      return () => { active = false }
    }

    const loadPreviewText = async () => {
      setDocumentPreviewLoading(true)
      setDocumentPreviewError("")

      try {
        const response = await fetch(previewHref)
        if (!response.ok) throw new Error("Preview file could not be loaded.")
        const text = await response.text()
        if (!active) return
        setDocumentPreviewText(text)
      } catch {
        if (!active) return
        setDocumentPreviewText("")
        setDocumentPreviewError("Preview content could not be loaded.")
      } finally {
        if (active) setDocumentPreviewLoading(false)
      }
    }

    void loadPreviewText()
    return () => { active = false }
  }, [viewingDocument])
  
  useEffect(() => {
    if (!stepParam && currentStageId === defaultWorkspaceRoadmap.currentStageId && roadmap.currentStageId !== currentStageId) {
      setCurrentStageId(roadmap.currentStageId)
    }
  }, [currentStageId, roadmap.currentStageId, stepParam])

  useEffect(() => {
    if (!stepParam) return
    const matchedStage = roadmapStages.find((stage) => stage.queryStep === stepParam)
    if (matchedStage) setCurrentStageId(matchedStage.id)
  }, [roadmapStages, stepParam])

  useEffect(() => {
    if (activeRoadmapStage?.id !== "pending-documents-triggers" && activeRoadmapStage?.id !== "final-review-check") return
    if (documentState.checklist.length > 0) return
    loadChecklistFromAgentY()
  }, [activeRoadmapStage?.id, documentState.checklist.length, loadChecklistFromAgentY])

  useEffect(() => {
    if (!pendingDocRequest) return
    if (documentState.checklist.length === 0) return
    const requiredDocs = documentState.checklist.filter((doc) => doc.required)
    requiredDocs.forEach((doc) => toggleRequestForCustomer(doc.id, true))
    if (requiredDocs[0]) markReceivedFromAgentY(requiredDocs[0].id)
    setPendingDocRequest(false)
  }, [pendingDocRequest, documentState.checklist, toggleRequestForCustomer, markReceivedFromAgentY])

  const openStage = (stage: WorkspaceRoadmapStage) => {
    setCurrentStageId(stage.id)
    setActiveSection(stage.opensSection)
    if (projectId) router.push(buildStageWorkspaceUrl(projectId, stage))
  }

  const handleAdvanceAction = () => {
    const action = activeRoadmapStage?.action
    if (!action) return
    if (action.type === "activate-stage") {
      const targetStage = roadmapStages.find((stage) => stage.id === action.targetStageId)
      if (!targetStage) return
      openStage(targetStage)
      return
    }
    if (action.targetSection) setActiveSection(action.targetSection)
    const nextHref = resolveRoadmapHref(action.hrefTemplate, projectId)
    if (nextHref) router.push(nextHref)
  }

  const handleProceedToFinalSubmission = () => {
    setShowCouncilSubmissionDialog(true)
  }

  const handleRequestDocuments = () => {
    if (documentState.checklist.length === 0) {
      setPendingDocRequest(true)
      loadChecklistFromAgentY()
      return
    }
    const requiredDocs = documentState.checklist.filter((doc) => doc.required)
    requiredDocs.forEach((doc) => toggleRequestForCustomer(doc.id, true))
    if (requiredDocs[0]) markReceivedFromAgentY(requiredDocs[0].id)
  }

  const handleJourneyDetailAction = (_stepIndex: number, _groupLabel: string, itemId: string, actionValue: string) => {
    setJourneyFieldActions((prev) => ({ ...prev, [itemId]: actionValue }))
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

  const handleSendBriefcase = (
    briefcaseKey: "documentation" | "compliance" | "drawings"
  ) => {
    setBriefcaseSent((prev) => ({
      ...prev,
      [briefcaseKey]: true,
    }))
  }

  const handleViewDocument = (item: BriefcaseDocumentItem) => {
    setViewingDocument(item)
  }

  const handleOpenDocument = (item: BriefcaseDocumentItem) => {
    if (!item.href) {
      setViewingDocument(item)
      return
    }

    window.open(item.href, "_blank", "noopener,noreferrer")
  }

  const handleOpenSurveyUpload = () => {
    surveyUploadInputRef.current?.click()
  }

  const handleSurveyReportUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const pdfFiles = files.filter((file) => isPdfDocument(file.name) || file.type === "application/pdf")
    if (pdfFiles.length === 0) return

    const uploadedAt = new Date().toLocaleString()
    const uploadedFiles = pdfFiles.map((file) => ({
      id: `survey-upload-${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: file.name,
      status: "PDF uploaded",
      href: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: ".pdf",
      uploadedAt,
      source: "Post-survey upload",
      note: "Uploaded after the survey for review in the survey reports workspace.",
    }))

    setSurveyReportUploads((prev) => [...uploadedFiles, ...prev])
    event.target.value = ""
  }

  const handleSubmitSurveyUpload = (itemId?: string) => {
    if (!itemId) return

    setSurveyReportUploads((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: "Submitted",
              note: "Submitted from the survey reports workspace for follow-up review.",
            }
          : item
      )
    )
  }

  const handleAssignDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setAssignStage("preview")
  }

  const addNote = () => {
    if (!noteText.trim()) return
    setNotes((prev) => [...prev, noteText.trim()])
    setNoteText("")
  }

  // ... [Derived data logic] ...
  const progressValue = roadmapStages.length > 1 ? Math.round((currentStep / (roadmapStages.length - 1)) * 100) : 0
  const missingDocsSentLog = logs.find((log) => log.action === "Missing documents sent to Agent X")
  const requiredDocsSentLog = logs.find((log) => log.action === "Required documents sent to Agent Y")
  const agentYSubmittedCount = logs.filter((log) => log.action === "Agent Y submitted missing document").length
  const checklistLoaded = documentState.checklist.length > 0
  const requiredChecklistDocs = documentState.checklist.filter((doc) => doc.required)
  const completedRequiredChecklistDocs = requiredChecklistDocs.filter((doc) => Boolean(doc.customerUpload || doc.agentYUpload || doc.agentXUpload))
  
  const allRequiredDocsCompleted = requiredChecklistDocs.length > 0 && completedRequiredChecklistDocs.length === requiredChecklistDocs.length
  const pendingEligibilitySteps = eligibilityData?.completionStatus.steps.filter((step) => !step.completed).map((step) => step.label) ?? []
  
  const applicantName = eligibilityData ? getEligibilityApplicantName(eligibilityData) ?? "-" : "-"
  const applicantEmail = formatEligibilityFieldValue(eligibilityData, "emailAddress")
  const applicantPhone = formatDisplayValue(eligibilityData ? getEligibilityFieldValue(eligibilityData, "phoneNumber") ?? getFirstMappedValue(eligibilityData, [["applicantAndProperty", "applicantDetails", "contactEmailPhone"]]) : undefined)
  const siteAddress = eligibilityData ? getEligibilitySiteAddress(eligibilityData) ?? "-" : "-"
  const postcode = formatEligibilityFieldValue(eligibilityData, "postcode")
  const purposeOfDevelopment = formatEligibilityFieldValue(eligibilityData, "purposeOfDevelopment")
  const propertyType = formatEligibilityFieldValue(eligibilityData, "propertyType")
  const ownershipStatus = formatEligibilityFieldValue(eligibilityData, "ownershipStatus")
  
  const existingPropertyWidth = formatEligibilityFieldValue(eligibilityData, "existingPropertyWidthM")
  const proposedWorksDescription = formatEligibilityFieldValue(eligibilityData, "proposedWorksDescription")
  const wallMaterials = formatEligibilityFieldValue(eligibilityData, "wallMaterials")
  const listedBuilding = formatEligibilityFieldValue(eligibilityData, "isListedBuilding")
  const treesWithTPO = formatEligibilityFieldValue(eligibilityData, "treesWithTPO")
  const floodRiskArea = formatEligibilityFieldValue(eligibilityData, "isSiteInFloodRiskArea")
  const vehicleAccess = formatEligibilityFieldValue(eligibilityData, "newOrAlteredAccess")
  const preAppAdvice = formatEligibilityFieldValue(eligibilityData, "soughtPreAppAdvice")
  const additionalConsents = formatEligibilityFieldValue(eligibilityData, "additionalConsents")
  const councilName = formatEligibilityFieldValue(eligibilityData, "council")
  const councilReference = formatEligibilityFieldValue(eligibilityData, "planningReferenceNumber")
  
  const locationPlanUrl = eligibilityData ? getEligibilityResourceValue(eligibilityData, "locationPlan") : undefined
  const sitePlanUrl = eligibilityData ? getEligibilityResourceValue(eligibilityData, "sitePlan") : undefined
  const elevationsUrl = eligibilityData ? getEligibilityResourceValue(eligibilityData, "existingAndProposedElevations") : undefined
  const photographsUrl = eligibilityData ? getEligibilityResourceValue(eligibilityData, "photographsOfSite") : undefined
  const additionalDrawingsUrl = eligibilityData ? getEligibilityResourceValue(eligibilityData, "additionalDrawings") : undefined
  
  const smokeAlarmsInstalled = formatEligibilityFieldValue(eligibilityData, "smokeAlarmsInstalled")
  const gasSafetyCertificate = formatEligibilityFieldValue(eligibilityData, "gasSafetyCertificate")
  const electricalReportEicr = formatEligibilityFieldValue(eligibilityData, "electricalReportEicr")
  const epcAvailable = formatEligibilityFieldValue(eligibilityData, "epcAvailable")
  const currentOccupantsCount = formatEligibilityFieldValue(eligibilityData, "currentOccupantsCount")
  const plannedOccupantsCount = formatEligibilityFieldValue(eligibilityData, "plannedOccupantsCount")
  const bathroomsOrShowerRoomsCount = formatEligibilityFieldValue(eligibilityData, "bathroomsOrShowerRoomsCount")
  const availableBedroomsCount = formatEligibilityFieldValue(eligibilityData, "availableBedroomsCount")
  const hasCommunalKitchen = formatEligibilityFieldValue(eligibilityData, "hasCommunalKitchen")
  const smallestBedroomSize = formatEligibilityFieldValue(eligibilityData, "smallestBedroomSize")
  const waterSupply = formatEligibilityFieldValue(eligibilityData, "waterSupply")
  const sewageOrDrainage = formatEligibilityFieldValue(eligibilityData, "sewageOrDrainage")
  const surfaceWaterDrainage = formatEligibilityFieldValue(eligibilityData, "surfaceWaterDrainage")
  const existingWasteArrangements = formatEligibilityFieldValue(eligibilityData, "existingWasteArrangements")
  const kitchenRoomLength = formatEligibilityFieldValue(eligibilityData, "kitchenRoomLengthM")
  const bathroomRoomWidth = formatEligibilityFieldValue(eligibilityData, "bathroomRoomWidthM")
  const previousProposalDetails = formatEligibilityFieldValue(eligibilityData, "previousProposalDetails")
  const surveyDateTimeValue = eligibilityData
    ? getFirstStringValue(eligibilityData, [
        ["surveyDateTime"],
        ["survey", "dateTime"],
        ["survey", "scheduledAt"],
        ["survey", "startsAt"],
        ["consultationDateTime"],
        ["consultation", "dateTime"],
        ["consultation", "scheduledAt"],
        ["consultation", "startsAt"],
        ["appointmentAt"],
        ["appointment", "dateTime"],
        ["appointment", "scheduledAt"],
        ["schedule", "scheduledAt"],
        ["schedule", "dateTime"],
        ["scheduledAt"],
      ])
    : undefined
  const surveyDateValue = eligibilityData
    ? getFirstStringValue(eligibilityData, [
        ["surveyDate"],
        ["survey", "date"],
        ["consultationDate"],
        ["consultation", "date"],
        ["appointmentDate"],
        ["appointment", "date"],
        ["schedule", "date"],
      ])
    : undefined
  const surveyTimeValue = eligibilityData
    ? getFirstStringValue(eligibilityData, [
        ["surveyTime"],
        ["survey", "time"],
        ["consultationTime"],
        ["consultation", "time"],
        ["appointmentTime"],
        ["appointment", "time"],
        ["schedule", "time"],
      ])
    : undefined
  const surveyLocationValue = eligibilityData
    ? getFirstStringValue(eligibilityData, [
        ["surveyLocation"],
        ["survey", "location"],
        ["consultationLocation"],
        ["consultation", "location"],
        ["appointmentLocation"],
        ["appointment", "location"],
        ["schedule", "location"],
      ])
    : undefined
  
  const submissionApplicantRows = eligibilityData
    ? [
        { key: "applicantName", label: "Applicant Name", value: applicantName },
        { key: "siteAddress", label: "Site Address", value: siteAddress, kind: "block" },
        ...buildEligibilityRows(eligibilityData, submissionApplicantFieldKeys),
      ]
    : []
  const submissionPropertyRows = eligibilityData ? buildEligibilityRows(eligibilityData, submissionPropertyFieldKeys) : []
  const dimensionsRows = eligibilityData ? buildEligibilityRows(eligibilityData, dimensionFieldKeys) : []
  const materialsRows = eligibilityData ? buildEligibilityRows(eligibilityData, materialsFieldKeys) : []
  const constraintRows = eligibilityData ? buildEligibilityRows(eligibilityData, constraintFieldKeys) : []
  const constraintSupportRows = eligibilityData ? buildEligibilityRows(eligibilityData, constraintSupportFieldKeys) : []

  const customer = {
    name: applicantName,
    phone: applicantPhone,
    email: applicantEmail,
    location: siteAddress,
    status: eligibilityData ? formatEligibilityStatus(eligibilityData.status) : "Live Data Pending",
  }
  
  const formSubmission = {
    applicantName, contactEmail: applicantEmail, contactPhone: applicantPhone, siteAddress, postcode, propertyType, ownershipStatus,
    conservationArea: formatEligibilityFieldValue(eligibilityData, "isInConservationArea"), purposeOfDevelopment,
    existingWidth: existingPropertyWidth, existingDepth: formatEligibilityFieldValue(eligibilityData, "existingPropertyDepthM"),
    proposedExtensionWidth: formatEligibilityFieldValue(eligibilityData, "proposedExtensionWidthM"),
    proposedExtensionDepth: formatEligibilityFieldValue(eligibilityData, "proposedExtensionDepthM"),
    externalMaterials: wallMaterials, briefDescription: proposedWorksDescription, listedBuilding, tpo: treesWithTPO, floodZone: floodRiskArea,
    vehicleAccess, preApplicationAdvice: preAppAdvice, additionalConsents,
    consultationBooked: false, consultationDate: "-", consultationTime: "-", consultant: "-", consultantTitle: "-", consultationType: "-", consultationDuration: "-",
  }
  
  const project = {
    id: projectId ?? "Unknown", clientId: resolvedProjectUserId ?? "-", clientName: applicantName, title: `Project ${projectId ?? "Unknown"}`,
    description: eligibilityData ? "Live project details derived from the connected eligibility record." : "No live project metadata connected yet.",
    service: purposeOfDevelopment, serviceType: "Mandatory HMO License", serviceNo: "-", stage: activeRoadmapStage?.label ?? "Unknown",
    location: siteAddress, postcode, status: eligibilityData?.status ?? "live_data_pending", createdDate: eligibilityData?.createdAt ?? "",
    updatedDate: eligibilityData?.updatedAt ?? "", agentX: "-", agentY: "-", architect: "-", progress: eligibilityData?.completionStatus.percentage ?? 0,
    estimatedCompletionDate: eligibilityData?.updatedAt ?? "", councilReference, councilName, timeline: "-",
  }
  
  const requirements = {
    propertyType, locationType: siteAddress, timeline: "-", scope: [formSubmission.purposeOfDevelopment, formSubmission.briefDescription].filter((item) => item !== "-"),
    constraints: [`Listed Building: ${formSubmission.listedBuilding}`, `Flood Zone: ${formSubmission.floodZone}`, `TPO: ${formSubmission.tpo}`],
    notes: "No additional live requirement notes connected yet.",
  }
  
  const subscriptionPlan = eligibilityData ? formatDisplayValue(getFirstMappedValue(eligibilityData, [["subscriptionDetails"], ["subscription", "plan"]])) : "-"
  const subscriptionPayment = {
    serviceName: project.serviceType, customerId: project.clientId, customerName: applicantName,
    subscription: subscriptionPlan === "-" ? "Bronze Plan" : subscriptionPlan,
    paymentDate: formatDateValue(eligibilityData?.updatedAt ?? eligibilityData?.createdAt), paymentId: `PAY-${project.id}`, amount: "140 GBP", status: "Paid",
  }
  const quote = { reference: subscriptionPayment.paymentId, submittedOn: subscriptionPayment.paymentDate, status: quoteGenerated ? "generated" : "draft", total: "140 GBP", breakdown: [] as { label: string; amount: string; pct: number }[] }
  
  const documentRoadmapItems = documentState.checklist.length > 0
    ? documentState.checklist.map((doc) => {
        const isReady = Boolean(doc.customerUpload || doc.agentYUpload || doc.agentXUpload)
        return { id: `document-${doc.id}`, label: `${doc.name}${doc.required ? " (Required)" : " (Optional)"}`, selectedAction: journeyFieldActions[`document-${doc.id}`] ?? (isReady ? "received" : "awaiting"), actions: roadmapDocumentActions }
      })
    : [{ id: "document-checklist-pending", label: "Eligibility checklist documents", selectedAction: journeyFieldActions["document-checklist-pending"] ?? "awaiting", actions: roadmapDocumentActions }]

  const complianceRoadmapItems = [
    { id: "compliance-smoke-alarms", label: "Smoke alarms", selectedAction: journeyFieldActions["compliance-smoke-alarms"] ?? (smokeAlarmsInstalled === "Yes" ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "compliance-gas-safety", label: "Gas Safety Certificate", selectedAction: journeyFieldActions["compliance-gas-safety"] ?? (gasSafetyCertificate === "Yes" ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "compliance-eicr", label: "Electrical Report (EICR)", selectedAction: journeyFieldActions["compliance-eicr"] ?? (electricalReportEicr === "Yes" ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "compliance-epc", label: "EPC", selectedAction: journeyFieldActions["compliance-epc"] ?? (epcAvailable === "Yes" ? "received" : "awaiting"), actions: roadmapDocumentActions },
  ]
  
  const drawingsRoadmapItems = [
    { id: "drawing-location-plan", label: "Location plan", selectedAction: journeyFieldActions["drawing-location-plan"] ?? (hasEligibilityResource(locationPlanUrl) ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "drawing-site-plan", label: "Site plan", selectedAction: journeyFieldActions["drawing-site-plan"] ?? (hasEligibilityResource(sitePlanUrl) ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "drawing-existing-proposed-plans", label: "Existing and Proposed Plans", selectedAction: journeyFieldActions["drawing-existing-proposed-plans"] ?? (hasEligibilityResource(additionalDrawingsUrl) ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "drawing-elevations", label: "Elevations", selectedAction: journeyFieldActions["drawing-elevations"] ?? (hasEligibilityResource(elevationsUrl) ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "drawing-photographs", label: "Photographs", selectedAction: journeyFieldActions["drawing-photographs"] ?? (hasEligibilityResource(photographsUrl) ? "received" : "awaiting"), actions: roadmapDocumentActions },
    { id: "drawing-additional", label: "Additional drawings", selectedAction: journeyFieldActions["drawing-additional"] ?? (hasEligibilityResource(additionalDrawingsUrl) ? "received" : "awaiting"), actions: roadmapDocumentActions },
  ]
  
  const dimensionsCompleted = dimensionsRows.some((row) => row.value !== "-")
  const anyDrawingAvailable = [locationPlanUrl, sitePlanUrl, elevationsUrl, photographsUrl, additionalDrawingsUrl].some((value) => hasEligibilityResource(value))
  const roomLayoutAnswered = [availableBedroomsCount, bathroomsOrShowerRoomsCount, hasCommunalKitchen].some((value) => formatDisplayValue(value) !== "-")
  const utilitiesAnswered = [waterSupply, sewageOrDrainage, surfaceWaterDrainage, existingWasteArrangements].some((value) => formatDisplayValue(value) !== "-")
  const kitchenDimensionsAnswered = formatDisplayValue(kitchenRoomLength) !== "-" || formatDisplayValue(bathroomRoomWidth) !== "-"
  const bathroomDimensionsAnswered = formatDisplayValue(formatEligibilityFieldValue(eligibilityData, "bathroomRoomLengthM")) !== "-" || formatDisplayValue(bathroomRoomWidth) !== "-"
  const declarationsCompleted = eligibilityData?.completionStatus.steps.some((step) => step.completed && (step.label.toLowerCase().includes("declaration") || step.key.toLowerCase().includes("declaration"))) ?? false
  const complianceDocumentsComplete = [gasSafetyCertificate, electricalReportEicr, epcAvailable].every((value) => value === "Yes")
  const surveyTimestamp = getScheduleTimestamp(surveyDateTimeValue, surveyDateValue, surveyTimeValue)
  const hasSurveyContext = dimensionsCompleted || anyDrawingAvailable || surveyReportUploads.length > 0
  const surveyFallbackTimestamp = hasSurveyContext ? eligibilityData?.updatedAt ?? eligibilityData?.createdAt : undefined
  const mockBookedSurvey = {
    date: "10 May 2026",
    time: "10:30",
    location: "E6 2RP",
  }
  const surveyDateDisplay = surveyTimestamp !== null
    ? formatDateValue(new Date(surveyTimestamp).toISOString())
    : surveyDateValue
      ? formatDateValue(surveyDateValue)
      : formatDateValue(surveyFallbackTimestamp) !== "-"
        ? formatDateValue(surveyFallbackTimestamp)
        : mockBookedSurvey.date
  const surveyTimeDisplay = surveyTimestamp !== null
    ? formatTimeValue(new Date(surveyTimestamp).toISOString())
    : surveyTimeValue
      ? formatTimeValue(surveyTimeValue)
      : formatTimeValue(surveyFallbackTimestamp) !== "-"
        ? formatTimeValue(surveyFallbackTimestamp)
        : mockBookedSurvey.time
  const surveyLocationDisplay = surveyLocationValue ?? (siteAddress !== "-" ? siteAddress : mockBookedSurvey.location)
  const applicationApplicantEmail = formatDisplayValue(applicationProject?.user?.email)
  const applicationApplicantPhone = formatDisplayValue(applicationProject?.user?.phoneNumber)
  const applicationLocationValue = applicationProject
    ? getFirstStringValue(applicationProject, [
        ["siteAddress"],
        ["fullAddress"],
        ["address"],
        ["location"],
        ["property", "address"],
        ["property", "siteAddress"],
        ["application", "siteAddress"],
        ["application", "address"],
        ["project", "siteAddress"],
        ["project", "address"],
      ])
    : undefined
  const applicationPostcodeValue = applicationProject
    ? getFirstStringValue(applicationProject, [
        ["postcode"],
        ["zipCode"],
        ["property", "postcode"],
        ["application", "postcode"],
        ["project", "postcode"],
      ])
    : undefined
  const surveyApplicantNameDisplay = applicationApplicantName !== "-" ? applicationApplicantName : applicantName
  const surveyApplicantEmailDisplay = applicationApplicantEmail !== "-" ? applicationApplicantEmail : applicantEmail
  const surveyApplicantPhoneDisplay = applicationApplicantPhone !== "-" ? applicationApplicantPhone : applicantPhone
  const surveyApplicationLocationDisplay = formatFullLocation(
    applicationLocationValue ?? siteAddress,
    applicationPostcodeValue ?? postcode
  )
  const surveyFullLocationDisplay = surveyApplicationLocationDisplay !== "-"
    ? surveyApplicationLocationDisplay
    : formatFullLocation(surveyLocationDisplay, applicationPostcodeValue ?? postcode)
  const councilSubmissionFeeStatus = getProjectPaymentStatus(applicationProject)
  const councilSubmissionFeeStatusLabel = councilSubmissionFeeStatus === "paid" ? "Paid" : "Due Pending"
  const councilSubmissionFeeStatusClasses = councilSubmissionFeeStatus === "paid"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700"
  const councilSubmissionFeeItems = [
    {
      category: "Mandatory HMO Licence",
      fee: `${formatCurrencyGBP(1400)} per property`,
      notes: "Applies to HMOs with 5+ occupants from 2+ households. Borough-wide coverage, no exemptions.",
      isTotal: false,
    },
    {
      category: "Planning Permission (Change of Use)",
      fee: formatCurrencyGBP(258),
      notes: "Standard national fee for change of use (C3 to C4 or Sui Generis). Required if converting to HMO.",
      isTotal: false,
    },
    // {
    //   category: "Additional HMO Licence (more than 5 occupants)",
    //   fee: formatCurrencyGBP(1250),
    //   notes: "Only relevant if applying under additional scheme, not mandatory.",
    //   isTotal: false,
    // },
    // {
    //   category: "Selective Licence (all rentals)",
    //   fee: formatCurrencyGBP(750),
    //   notes: "Applies to all rented properties in Newham, separate from HMO licence.",
    //   isTotal: false,
    // },
    {
      category: "Total (Mandatory HMO + Planning)",
      fee: `${formatCurrencyGBP(1658)}`,
      notes: "Core submission cost for a 5+ person HMO with planning change of use.",
      isTotal: true,
    },
  ]

  const triggerRoadmapItems = [
    {
      id: "trigger-survey",
      label: "Insights for Agent X but not limited to the information as mentioned below",
      details: [
        "PLANNING TRIGGERS",
        "Property moves from C3 (single dwelling) -> C4 (small HMO)",
        "LICENSING TRIGGERS (MANDATORY HMO LICENCE)",
        "5 or more occupants",
        "BUILDING CONTROL TRIGGERS",
        "New partitions or walls are added",
        "Rear Extension is involved",
        "New bathrooms or kitchens are added",
      ],
      selectedAction: journeyFieldActions["trigger-survey"] ?? (dimensionsCompleted ? "received" : "awaiting"),
      actions: roadmapDocumentActions,
    },
    {
      id: "trigger-dimensions",
      label: "Dimensions & Space Standards for Agent X but not limited to the information as mentioned below",
      details: [
        "BEDROOM SIZE REQUIREMENTS (NEWHAM)",
        "Single Occupancy: 6.51m² (min) / 7.5m² (recommended)",
        "Double Occupancy: 10.22m² (min) / 11m² (recommended)",
        "Rooms under 4.64m²: Cannot be used as bedroom (storage only)",
        "Must have: Natural light, Heating, Ventilation",
        "COMMUNAL SPACE (KITCHEN ONLY)",
        "5 occupants: 7m²",
        "6–7 occupants: 10m²",
        "8–10 occupants: 11.5m²",
        "COMMUNAL SPACE (KITCHEN + SEPARATE LIVING ROOM)",
        "Kitchen: 5m² minimum",
        "Living Room: 11m² for 5 people (+1m² per additional person)",
        "OPEN-PLAN KITCHEN / LOUNGE",
        "5 occupants: 15m²",
        "6–7 occupants: 18m²",
        "8–10 occupants: 20m²",
      ],
      selectedAction: journeyFieldActions["trigger-dimensions"] ?? (dimensionsCompleted ? "received" : "awaiting"),
      actions: roadmapDocumentActions,
    },
    {
      id: "trigger-compliance-documents",
      label: "Compliance & Reports for Agent X but not limited to the information as mentioned below",
      details: [
        "REPORTS & SURVEYS",
        "Site Measurement Survey",
        "Existing & Proposed Plans",
        "Arboriculture / BS5837 Report",
        "Flood Risk Assessment",
        "COMPLIANCE CERTIFICATES",
        "Smoke Alarms Compliance",
        "Gas Safety Certificate",
        "Electrical Report (EICR)",
        "Energy Performance Certificate (EPC)",
      ],
      selectedAction: journeyFieldActions["trigger-compliance-documents"] ?? (complianceDocumentsComplete ? "received" : "awaiting"),
      actions: roadmapDocumentActions,
    },
  ];
  
  // Services State
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceAmount, setNewServiceAmount] = useState("");
  const [quoteServices, setQuoteServices] = useState<QuoteService[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editServiceName, setEditServiceName] = useState("")
  const [editServiceAmount, setEditServiceAmount] = useState("")
  const [editServiceSubmitting, setEditServiceSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const loadServiceCart = async () => {
      if (!projectId || !resolvedProjectUserId) {
        setServiceCart(null)
        setCartLoading(false)
        setCartError(null)
        return
      }

      setCartLoading(true)
      setCartError(null)

      try {
        const response = await axiosInstance.get<ServiceCartResponse>(
          `/service-cart/${encodeURIComponent(projectId)}`,
          {
            params: {
              projectId,
              userId: resolvedProjectUserId,
            },
          }
        )

        if (!active) return

        const nextCart = getLatestServiceCart(response.data.data)
        setServiceCart(nextCart)
        setQuoteServices(mapServiceCartToQuoteServices(nextCart))
      } catch (error) {
        if (!active) return
        setServiceCart(null)
        setCartError("Unable to load payment-stage services right now.")
        console.error("Failed to fetch service cart", error)
      } finally {
        if (active) setCartLoading(false)
      }
    }

    void loadServiceCart()
    return () => { active = false }
  }, [projectId, resolvedProjectUserId])

  const handleAddService = () => {
    const serviceName = newServiceName.trim()
    const payment = Number(newServiceAmount)

    if (!serviceName || !Number.isFinite(payment) || payment <= 0 || !resolvedProjectUserId || !projectId) return

    const addService = async () => {
      setAddServiceSubmitting(true)
      setAddServiceError(null)

      try {
        const shouldCreateNewCart =
          !serviceCart?.cartId || quotedCartIds.includes(serviceCart.cartId)

        const createCartPayload: AddServiceCartPayload = {
          projectId,
          userId: resolvedProjectUserId,
          services: [
            {
              serviceName,
              payment,
            },
          ],
        }

        let nextCart: ServiceCartData | null = null

        if (shouldCreateNewCart) {
          const createCartResponse = await axiosInstance.post<ServiceCartResponse>(
            `/service-cart`,
            createCartPayload
          )

          nextCart = createCartResponse.data.data ?? null
        } else {
          const updateCartPayload = {
            userId: resolvedProjectUserId,
            services: [
              {
                serviceName,
                payment,
              },
            ],
          }

          const updateCartResponse = await axiosInstance.put<ServiceCartResponse>(
            `/service-cart/cart/${encodeURIComponent(serviceCart.cartId)}`,
            updateCartPayload
          )

          nextCart = updateCartResponse.data.data ?? null
        }

        if (!nextCart?.cartId) {
          const response = await axiosInstance.get<ServiceCartResponse>(
            `/service-cart/${encodeURIComponent(projectId)}`,
            {
              params: {
                projectId,
                userId: resolvedProjectUserId,
              },
            }
          )

          nextCart = getLatestServiceCart(response.data.data)
        }

        setServiceCart(nextCart)
        setQuoteGenerated(false)
        setQuoteSubmitError(null)
        setQuotedCartIds((current) =>
          nextCart?.cartId ? current.filter((cartId) => cartId !== nextCart.cartId) : current
        )
        setQuoteServices(mapServiceCartToQuoteServices(nextCart))
        setNewServiceName("")
        setNewServiceAmount("")
      } catch (error) {
        setAddServiceError("Unable to add the new service to the cart right now.")
        console.error("Failed to add service to cart", error)
      } finally {
        setAddServiceSubmitting(false)
      }
    }

    void addService()
  };
  
  const handleDeleteService = (id: string) => { setQuoteServices((prev) => prev.filter((service) => service.id !== id)); };

  const handleStartEditService = (service: QuoteService) => {
    setEditingServiceId(service.id)
    setEditServiceName(service.title)
    setEditServiceAmount(String(parsePaymentAmount(service.amount)))
    setAddServiceError(null)
  }

  const handleCancelEditService = () => {
    setEditingServiceId(null)
    setEditServiceName("")
    setEditServiceAmount("")
    setAddServiceError(null)
  }

  const handleSaveEditService = (id: string) => {
    const serviceName = editServiceName.trim()
    const payment = Number(editServiceAmount)

    if (!serviceName || !Number.isFinite(payment) || payment <= 0 || !projectId) {
      setAddServiceError("Enter a valid service name and amount before saving.")
      return
    }

    const saveEdit = async () => {
      setEditServiceSubmitting(true)
      setAddServiceError(null)

      const nextQuoteServices = quoteServices.map((service) =>
        service.id === id
          ? {
              ...service,
              title: serviceName,
              amount: formatPaymentAmount(payment),
            }
          : service
      )

      try {
        const updateServicePayload: UpdateServiceCartItemPayload = {
          serviceName,
          payment,
        }

        await axiosInstance.put(
          `/service-cart/${encodeURIComponent(id)}`,
          updateServicePayload
        )

        const refreshedCartResponse = await axiosInstance.get<ServiceCartResponse>(
          `/service-cart/${encodeURIComponent(projectId)}`,
          {
            params: {
              projectId,
              userId: resolvedProjectUserId,
            },
          }
        )

        const nextCart = getLatestServiceCart(refreshedCartResponse.data.data)

        if (nextCart) {
          setServiceCart(nextCart)
          setQuoteServices(mapServiceCartToQuoteServices(nextCart))
        } else {
          setQuoteServices(nextQuoteServices)
        }

        handleCancelEditService()
      } catch (error) {
        setAddServiceError("Unable to update this service right now.")
        console.error("Failed to edit service in cart", error)
      } finally {
        setEditServiceSubmitting(false)
      }
    }

    void saveEdit()
  }

  const generateInvoicePDF = (quoteData?: GeneratedQuote | null) => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    const targetClientName = quoteData?.clientName || applicantName;
    const targetServices = quoteData?.services || quoteServices;
    const targetTotal = quoteData?.amount || quoteCartTotal;

    doc.setFontSize(18); doc.text("Ai4Planning", 14, 20);
    doc.setFontSize(10); doc.text(`Date: ${today}`, 150, 20);
    doc.setFontSize(12); doc.text(`Customer Name: ${targetClientName}`, 14, 30); 
    doc.setFontSize(14); doc.text("QUOTE", 90, 40);
    
    let y = 50;
    doc.setFontSize(11); doc.text("Service", 14, y); doc.text("Amount", 160, y);
    y += 5; doc.line(14, y, 195, y);
    y += 10;
    let total = 0;
    targetServices.forEach((service) => {
      doc.text(service.title, 14, y); doc.text(service.amount, 160, y);
      const amountVal = parseFloat(service.amount.replace(' GBP', ''));
      if (!isNaN(amountVal)) total += amountVal;
      y += 10;
    });
    doc.line(14, y, 195, y); y += 10;
    doc.setFontSize(12); doc.text(`Total: ${quoteData ? targetTotal : `${total} GBP`}`, 140, y);
    doc.save("invoice.pdf");
  };

  const quoteCartTotal = `${quoteServices.reduce((sum, item) => sum + parseFloat(item.amount.replace(' GBP', '') || "0"), 0)} GBP`;
  const quoteStatusLabel = quoteGenerated ? "Quote generated" : "Draft quote";
  quote.total = quoteCartTotal;
  quote.breakdown = quoteServices.map((service) => ({ label: service.title, amount: service.amount, pct: 25 }));

  const handleCreateQuote = () => {
    if (quoteServices.length === 0 || !projectId || !resolvedProjectUserId || !serviceCart?.cartId) return

    const submitQuote = async () => {
      setQuoteSubmitting(true)
      setQuoteSubmitError(null)

      try {
        const payload: ServiceCartUpdatePayload = {
          cartId: serviceCart.cartId,
          userId: resolvedProjectUserId,
          notes: "Quotation generated for final approval",
        }

        await axiosInstance.post(
          `/service-cart/${encodeURIComponent(projectId)}/quotation`,
          payload,
          {
            params: {
              userId: resolvedProjectUserId,
            },
          }
        )

        await loadGeneratedQuotations()
        setQuoteGenerated(true);
        setServiceCart(null)
        setQuoteServices([])
        setCartError(null)
        setAddServiceError(null)
        setNotes((prev) => ["Quotation generated for final approval", ...prev])
      } catch (error) {
        setQuoteSubmitError("Unable to save the quotation details right now.")
        console.error("Failed to update service cart", error)
      } finally {
        setQuoteSubmitting(false)
      }
    }

    void submitQuote()
  };
const handleGenerateCouncilQuotation = () => {
  if (!projectId || !resolvedProjectUserId) return

  const validRows = councilFeeRows.filter(
    (row) =>
      row.label.trim() !== "" &&
      row.amount.trim() !== "" &&
      Number.isFinite(Number(row.amount)) &&
      Number(row.amount) > 0
  )

  if (validRows.length === 0) return

  const submitQuotation = async () => {
    setCouncilFeeSubmitting(true)
    setCouncilFeeSubmitError(null)

    try {
      const payload = {
        userId: resolvedProjectUserId,
        projectId,
        services: validRows.map((row) => ({
          serviceName: row.label.trim(),
          payment: Number(row.amount),
        })),
      }

      await axiosInstance.post(
        `/service-cart/${encodeURIComponent(projectId)}/quotation`,
        payload,
        {
          params: {
            userId: resolvedProjectUserId,
          },
        }
      )

      setCouncilFeeSubmitted(true)
      await loadGeneratedQuotations()
      setNotes((prev) => ["Council fee quotation generated successfully", ...prev])
    } catch (error) {
      setCouncilFeeSubmitError("Unable to generate the council fee quotation right now.")
      console.error("Failed to generate council fee quotation", error)
    } finally {
      setCouncilFeeSubmitting(false)
    }
  }

  void submitQuotation()
}
  const handleViewQuote = (quote: GeneratedQuote) => { setViewingQuote(quote); };
  const handleSendToCustomer = (quoteId: string) => {
    setQuoteHistory((prev) => prev.map(q => q.id === quoteId ? {...q, status: "Sent"} : q));
    alert("Quote sent to Customer Dashboard (Mock)");
  };

  const briefcaseRoadmapItems = allRequiredDocsCompleted ? ["Documents Briefcase", "Compliance Briefcase", "Drawings Briefcase"] : []
  const pendingDocumentsJourneyGroups = [
    { label: "Triggers", items: triggerRoadmapItems },
    { label: "Documents", items: documentRoadmapItems },
    { label: "Compliance", items: complianceRoadmapItems },
    { label: "Drawings", items: drawingsRoadmapItems },
    { label: "Briefcases", items: briefcaseRoadmapItems },
  ]
  
  const paymentRoadmapItems = [`Service name: ${subscriptionPayment.serviceName}`, `Customer name: ${subscriptionPayment.customerName}`, `Subscription: ${subscriptionPayment.subscription}`, `Payment date: ${subscriptionPayment.paymentDate}`, `Payment ID: ${subscriptionPayment.paymentId}`, `Amount: ${subscriptionPayment.amount}`]
  const gasSafetyDoc = findChecklistDocumentByKeywords(documentState.checklist, ["gas safety", "cp12"])
  const eicrDoc = findChecklistDocumentByKeywords(documentState.checklist, ["electrical report", "eicr"])
  const epcDoc = findChecklistDocumentByKeywords(documentState.checklist, ["energy performance", "epc"])
  const fireRiskDoc = findChecklistDocumentByKeywords(documentState.checklist, ["fire risk assessment", "fire safety"])
  const ownershipDoc = findChecklistDocumentByKeywords(documentState.checklist, ["ownership", "title register", "ownership certificate"])
  const leaseholderConsentDoc = findChecklistDocumentByKeywords(documentState.checklist, ["leaseholder consent", "leasehold consent"])
  const lenderConsentDoc = findChecklistDocumentByKeywords(documentState.checklist, ["mortgage lender consent", "mortgage consent"])
  const tenancyAgreementDoc = findChecklistDocumentByKeywords(documentState.checklist, ["tenancy agreement", "tenancy agreements"])
  const managementPlanDoc = findChecklistDocumentByKeywords(documentState.checklist, ["management plan"])
  const fitAndProperDoc = findChecklistDocumentByKeywords(documentState.checklist, ["fit proper", "fit and proper", "declaration"])
  const planningDoc = findChecklistDocumentByKeywords(documentState.checklist, ["planning permission", "planning certificate", "planning reference"])

  // --- BRIEFCASE DATA DERIVATION ---
  const documentationItems: BriefcaseDocumentItem[] = [
    { label: "Gas Safety Certificate (CP12)", status: gasSafetyCertificate === "Yes" ? "Received" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(gasSafetyDoc) },
    { label: "Electrical Report (EICR)", status: electricalReportEicr === "Yes" ? "Received" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(eicrDoc) },
    { label: "Energy Performance Certificate (EPC)", status: epcAvailable === "Yes" ? "Received" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(epcDoc) },
    { label: "Fire Risk Assessment", status: fireRiskDoc ? "Received" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(fireRiskDoc) },
    { label: "Existing Planning Permissions", status: planningDoc ? "Provided" : "Unknown", fileType: ".pdf", ...getChecklistPreviewMeta(planningDoc) },
    { label: "Management Plan", status: managementPlanDoc ? "Provided" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(managementPlanDoc) },
    { label: "Fit & Proper Declaration", status: fitAndProperDoc ? "Provided" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(fitAndProperDoc) },
    { label: "Tenancy Agreements", status: tenancyAgreementDoc ? "Provided" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(tenancyAgreementDoc) },
    { label: "Ownership/Lease/Mortgage Consents", status: ownershipDoc ? "Provided" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(ownershipDoc ?? leaseholderConsentDoc ?? lenderConsentDoc) },
  ];

  const complianceItems: BriefcaseDocumentItem[] = [
    // Fire Safety
    { label: "Smoke/heat alarm layout", status: smokeAlarmsInstalled === "Yes" ? "Provided" : "Awaiting Response", group: "Fire Safety", note: "Alarm layout evidence is reviewed from safety compliance responses." },
    { label: "Fire doors (FD30)", status: fireRiskDoc ? "Confirmed" : "Unconfirmed", group: "Fire Safety", fileType: ".pdf", ...getChecklistPreviewMeta(fireRiskDoc) },
    { label: "Escape routes", status: fireRiskDoc ? "Compliant" : "Unknown", group: "Fire Safety", fileType: ".pdf", ...getChecklistPreviewMeta(fireRiskDoc) },
    { label: "Emergency lighting", status: "Awaiting Response", group: "Fire Safety", note: "No emergency-lighting evidence is linked yet in the workspace." },
    // Amenities
    { label: "Kitchen adequacy", status: hasCommunalKitchen === "Yes" ? "Pass" : "Pending Evidence", group: "Amenities", note: "Kitchen adequacy is inferred from communal kitchen and room-dimension answers." },
    { label: "Bathroom ratio", status: bathroomsOrShowerRoomsCount !== "-" ? "Pass" : "Pending Evidence", group: "Amenities", note: "Bathroom ratio is reviewed from the occupant and bathroom counts." },
    { label: "Ventilation/heating", status: dimensionsCompleted ? "Pass" : "Unknown", group: "Amenities", note: "Ventilation and heating evidence depends on room measurements and layout data." },
    // Environmental
    { label: "Water supply", status: waterSupply !== "-" ? "Verified" : "Unverified", group: "Environmental", note: "Water-supply evidence is based on the utility answers collected in eligibility." },
    { label: "Sewage/drainage", status: sewageOrDrainage !== "-" ? "Verified" : "Unverified", group: "Environmental", note: "Drainage evidence is based on the sewage and drainage responses." },
    { label: "Surface water drainage", status: surfaceWaterDrainage !== "-" ? "Verified" : "Unverified", group: "Environmental", note: "Surface-water evidence is based on the site drainage answers." },
    { label: "Waste arrangements", status: existingWasteArrangements !== "-" ? "Compliant" : "Unknown", group: "Environmental", note: "Waste arrangement evidence is based on the uploaded or answered waste details." },
    // Space Standards
    { label: "Bedroom sizes", status: smallestBedroomSize !== "-" ? "Pass" : "Pending Measurements", group: "Space Standards", note: "Bedroom size compliance is reviewed from the smallest bedroom and dimension answers." },
    { label: "Communal space", status: availableBedroomsCount !== "-" ? "Pass" : "Pending Measurements", group: "Space Standards", note: "Communal space evidence is based on bedroom counts and room-layout details." },
  ];

  const drawingItems: BriefcaseDocumentItem[] = [
    { label: "Existing floor plans (to scale)", status: hasEligibilityResource(additionalDrawingsUrl) ? "Provided" : "Awaiting Response", href: typeof additionalDrawingsUrl === "string" ? additionalDrawingsUrl : undefined, fileType: ".pdf", note: "Open the uploaded drawing pack linked to the project." },
    { label: "Proposed floor plans (to scale)", status: hasEligibilityResource(additionalDrawingsUrl) ? "Provided" : "Awaiting Response", href: typeof additionalDrawingsUrl === "string" ? additionalDrawingsUrl : undefined, fileType: ".pdf", note: "Open the uploaded proposed drawing set linked to the project." },
    { label: "Fire safety plan", status: fireRiskDoc ? "Provided" : "Awaiting Response", fileType: ".pdf", ...getChecklistPreviewMeta(fireRiskDoc) },
    { label: "Existing & proposed elevations", status: hasEligibilityResource(elevationsUrl) ? "Provided" : "Awaiting Response", href: typeof elevationsUrl === "string" ? elevationsUrl : undefined, fileType: ".pdf" },
    { label: "Location plan (1:1250)", status: hasEligibilityResource(locationPlanUrl) ? "Provided" : "Awaiting Response", href: typeof locationPlanUrl === "string" ? locationPlanUrl : undefined, fileType: ".pdf" },
    { label: "Block/site plan", status: hasEligibilityResource(sitePlanUrl) ? "Provided" : "Awaiting Response", href: typeof sitePlanUrl === "string" ? sitePlanUrl : undefined, fileType: ".pdf" },
    { label: "Sections (if structural changes)", status: hasEligibilityResource(additionalDrawingsUrl) ? "Provided" : "Awaiting Response", href: typeof additionalDrawingsUrl === "string" ? additionalDrawingsUrl : undefined, fileType: ".pdf", note: "Section drawings are expected within the additional drawing pack." },
  ];

  const drawingInputs: BriefcaseDocumentItem[] = [
    { label: "Measurements", status: dimensionsCompleted ? "Complete" : "Pending Measurements", note: "Measurements are drawn from the eligibility dimension answers." },
    { label: "Site visit data", status: "Available", note: "Site visit data is available for the drawing briefcase review." }, 
    { label: "Photos", status: hasEligibilityResource(photographsUrl) ? "Provided" : "Awaiting Response", href: typeof photographsUrl === "string" ? photographsUrl : undefined, fileType: ".jpg" },
  ];

   const surveyReportDrawingFiles: BriefcaseDocumentItem[] = [
    {
      label: "Site plan",
      status: "PDF linked",
      href: typeof sitePlanUrl === "string" ? sitePlanUrl : undefined,
      fileName: typeof sitePlanUrl === "string" ? getFileNameFromHref(sitePlanUrl) : undefined,
      fileType: typeof sitePlanUrl === "string" ? getFileTypeLabel(sitePlanUrl) : ".pdf",
      source: "Eligibility resource",
      note: "Open the site plan used during the survey and planning review.",
    },
    {
      label: "Measured survey drawings",
      status: "PDF linked",
      href: typeof additionalDrawingsUrl === "string" ? additionalDrawingsUrl : undefined,
      fileName: typeof additionalDrawingsUrl === "string" ? getFileNameFromHref(additionalDrawingsUrl) : undefined,
      fileType: typeof additionalDrawingsUrl === "string" ? getFileTypeLabel(additionalDrawingsUrl) : ".pdf",
      source: "Eligibility resource",
      note: "Includes the drawing pack captured from the latest survey information.",
    }
  ]
  const surveyReportLinkedFiles: BriefcaseDocumentItem[] = [
    ...surveyReportDrawingFiles.filter((item) => item.href),
    {
      label: "HMO Survey Crib Sheet",
      status: "DOCX linked",
      href: "/survey-files/wolseley-avenue-e6-hmo-survey-crib-sheet-v3.docx",
      previewHref: "/survey-files/previews/wolseley-avenue-e6-hmo-survey-crib-sheet-v3.pdf",
      fileName: "Wolseley Avenue E6 - HMO Survey Crib Sheet v3.docx",
      fileType: ".docx",
      note: "Linked local survey crib sheet for the booked Wolseley Avenue survey.",
    },
    {
      label: "Project Survey and Feasibility Pack",
      status: "DOCX linked",
      href: "/survey-files/wolseley-avenue-e6-project-survey-and-feasibility-pack-v3-copy.docx",
      previewHref: "/survey-files/previews/wolseley-avenue-e6-project-survey-and-feasibility-pack-v3-copy.pdf",
      fileName: "Wolseley Avenue E6 - Project Survey and Feasibility Pack - v3 - Copy.docx",
      fileType: ".docx",
      note: "Linked local feasibility pack for the booked Wolseley Avenue survey.",
    },
  ]
  const surveyReportUploadedPdfFiles = surveyReportUploads.filter((item) => isPdfDocument(item.fileName ?? item.href))
  const councilReadySubmissionPackItems: BriefcaseDocumentItem[] = [
    {
      label: "Application Form Name",
      status: "Ready",
      href: "/council-submission-pack/g5750form004-england-en.pdf",
      fileName: "G5750Form004_england_en.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Council-ready form included in the final submission pack.",
    },
    {
      label: "Newham Council Officer Report",
      status: "Ready",
      href: "/council-submission-pack/newham-council-officer-report-2.pdf",
      fileName: "Newham council officer report 2.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Council officer report included in the final submission pack.",
    },
    {
      label: "Strategic Flood Risk Assessment",
      status: "Ready",
      href: "/council-submission-pack/newham-level-2-strategic-flood-risk-assessment.pdf",
      fileName: "Newham_Level_2_Strategic_Flood_Risk_Assessment.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Flood risk assessment included in the final submission pack.",
    },
    {
      label: "Arboricultural Report",
      status: "Ready",
      href: "/council-submission-pack/arboricultural-report.pdf",
      fileName: "Arboricultural Report.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Arboricultural report included in the final submission pack.",
    },
    {
      label: "Gas Safety Certificate",
      status: "Ready",
      href: "/council-submission-pack/gas-safety-certificate.pdf",
      fileName: "Gas Safety Certificate.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Gas safety certificate included in the final submission pack.",
    },
    {
      label: "EICR Sample Report",
      status: "Ready",
      href: "/council-submission-pack/eicr-sample-report.pdf",
      fileName: "EICR-Sample-Report.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "EICR report included in the final submission pack.",
    },
    {
      label: "Energy Performance Certificate",
      status: "Ready",
      href: "/council-submission-pack/energy-performance-certificate.pdf",
      fileName: "Energy Performance Certificate.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Energy performance certificate included in the final submission pack.",
    },
    {
      label: "Original Layout - New Walls",
      status: "Ready",
      href: "/council-submission-pack/original-layout-new-walls-21-04-26.pdf",
      fileName: "ORIGINAL LAYOUT-NEW WALLS 21.04.26 (1).pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Original layout drawing included in the final submission pack.",
    },
    {
      label: "Proposed Layout V5",
      status: "Ready",
      href: "/council-submission-pack/proposed-layout-v5.pdf",
      fileName: "PROPOSED LAYOUT V5.pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Proposed layout V5 included in the final submission pack.",
    },
    {
      label: "Proposed Layout 21.04.26",
      status: "Ready",
      href: "/council-submission-pack/proposed-layout-21-04-26.pdf",
      fileName: "PROPOSED LAYOUT 21.04.26 (1) (1).pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Proposed layout revision dated 21.04.26 included in the final submission pack.",
    },
    {
      label: "Original Site Layout",
      status: "Ready",
      href: "/council-submission-pack/ai4p-survey.pdf",
      fileName: "AI4P SURVEY (1).pdf",
      fileType: ".pdf",
      source: "Council ready submission pack",
      note: "Survey report included in the final submission pack.",
    },
    {
      label: "Site Visited Data",
      status: "Ready",
      href: "/survey-files/wolseley-avenue-e6-hmo-survey-crib-sheet-v3.docx",
      previewHref: "/survey-files/previews/wolseley-avenue-e6-hmo-survey-crib-sheet-v3.pdf",
      fileName: "Wolseley Avenue E6 - HMO Survey Crib Sheet v3.docx",
      fileType: ".docx",
      source: "Council ready submission pack",
      note: "Survey crib sheet included in the final submission pack.",
    },
  ]

  const statusSummaryItems = [
    { label: "Gas Safety Certificate (CP12)", status: gasSafetyCertificate === "Yes" ? "Received" : gasSafetyCertificate === "No" ? "Missing" : "Pending Verification", fileType: ".pdf" },
    { label: "Electrical Report (EICR)", status: electricalReportEicr === "Yes" ? "Received" : electricalReportEicr === "No" ? "Missing" : "Pending Verification", fileType: ".pdf" },
    { label: "Energy Performance Certificate (EPC)", status: epcAvailable === "Yes" ? "Received" : epcAvailable === "No" ? "Missing" : "Pending Verification", fileType: ".pdf" },
    { label: "Fire Risk Assessment", status: fireRiskDoc ? "Received" : smokeAlarmsInstalled === "No" ? "Not Applicable" : "Missing", fileType: ".pdf" },
    { label: "Existing Planning Permissions", status: planningDoc ? "Provided" : "Unknown", fileType: ".pdf" },
    { label: "Management Plan", status: managementPlanDoc ? "Provided" : "Missing", fileType: ".pdf" },
    { label: "Fit & Proper Declaration", status: fitAndProperDoc ? "Provided" : "Missing", fileType: ".pdf" },
    { label: "Tenancy Agreements", status: tenancyAgreementDoc || currentOccupantsCount !== "-" || plannedOccupantsCount !== "-" ? (tenancyAgreementDoc ? "Provided" : "Missing") : "Not Required", fileType: ".pdf" },
    { label: "Ownership/Lease/Mortgage Consents", status: ownershipDoc || leaseholderConsentDoc || lenderConsentDoc ? "Provided" : /lease|mortgage/i.test(ownershipStatus) ? "Missing" : "Not Required", fileType: ".pdf" },
  ]

  const ownershipStatusDisplay = formatDisplayValue(ownershipStatus).toLowerCase()
  const isLeaseholdCase = ownershipStatusDisplay.includes("lease")
  const finalReviewChecklistGroups: FinalReviewChecklistGroup[] = [
    { label: "Documents", items: CHECKLIST_DOCUMENTS.map((item) => ({ label: item, status: "completed" as ReviewChecklistStatus })) },
    { label: "Compliance", items: CHECKLIST_COMPLIANCE.map((item) => ({ label: item, status: "completed" as ReviewChecklistStatus })) },
    { label: "Drawings", items: CHECKLIST_DRAWINGS.map((item) => ({ label: item, status: "completed" as ReviewChecklistStatus })) },
  ]
  
  const finalReviewChecklistItems = finalReviewChecklistGroups.flatMap((group) => group.items)
  const completedFinalReviewChecklistItems = finalReviewChecklistItems.filter((item) => item.status === "completed")
  const inProgressFinalReviewChecklistItems = finalReviewChecklistItems.filter((item) => item.status === "in-progress")
  const pendingFinalReviewChecklistItems = finalReviewChecklistItems.filter((item) => item.status === "pending")
  const councilSubmissionItems: string[] = []
  
  const journeySteps: JourneyStep[] = roadmapStages.map((stage): JourneyStep =>
    stage.id === "checklist" ? { ...stage, calloutLabel: "", desc: "" }
    : stage.id === "pending-documents-triggers" ? { ...stage, desc: !checklistLoaded ? "Checklist pending from eligibility and document review." : allRequiredDocsCompleted ? "All pending documents are complete. Documents, compliance, and drawings briefcases are ready." : "Pending documents, compliance, drawings, and trigger follow-ups are being tracked here." }
    : stage.id === "eligibility-check" && eligibilityData ? { ...stage, calloutLabel: eligibilityData.completionStatus.isCompleted ? "Agent Z Response to you" : undefined, details: pendingEligibilitySteps, detailsLabel: "Pending eligibility sections", desc: eligibilityData.completionStatus.isCompleted ? "Newham HMO licensing review ready for verification." : `Eligibility form is ${eligibilityData.completionStatus.percentage}% complete.`, calloutTypewriterText: eligibilityData.completionStatus.isCompleted ? eligibilityReviewBrief : undefined, calloutStyle: eligibilityData.completionStatus.isCompleted ? "eligibility" : undefined, hideNextLabel: eligibilityData.completionStatus.isCompleted }
    : stage.id === "payments-generate-quote" ? { ...stage, desc: "Review the subscription payment details for this project." }
    : stage.id === "final-review-check" ? { ...stage, desc: "Review the checklist, uploaded documents, and eligibility answers before submission." }
    : stage.id === "council-fee" ? { ...stage, desc: "Review payment details before moving to final submission." }
    : stage.id === "council-submission" ? { ...stage, detailGroups: [] }
    : stage
  )
  
  const sectionMeta: Record<SectionId, { title: string; hint: string }> = {
    project: { title: "Project Overview", hint: "Snapshot of progress, client context, and delivery status." },
    coordination: { title: "Document Requests", hint: "Agent X mediation flow between Agent Y and customer." },
    communication: { title: "Client Communication", hint: "Customer communication channel managed only by Agent X." },
    documents: { title: "Project Documents", hint: "Required docs from Agent Y and customer uploads managed in one place." },
    payments: { title: "Payment Details", hint: "Payment milestones and pending balance visibility." },
    notes: { title: "Internal Notes", hint: "Private operational notes for Agent X workspace." },
    requirements: { title: "Client Requirements", hint: "Scope, constraints, and requirements from customer brief." },
    submission: { title: "Form Submission", hint: "Original customer submission and property details." },
    dimensions: { title: "Dimensions", hint: "Existing and proposed build dimensions and materials." },
    constraints: { title: "Constraints", hint: "Planning restrictions and risk flags." },
    consultation: { title: "Consultation", hint: "Consultation schedule and expert assignment details." },
    quote: { title: "Quote Summary", hint: "Project financial breakdown and quote status." },
    profile: { title: "Customer Profile", hint: "Customer identity and contact information." },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
       <CustomerJourney
      steps={journeySteps}
      currentStep={currentStep}
      showAdvance={Boolean(activeRoadmapStage?.action) && activeRoadmapStage?.id !== "checklist"}
      onDetailAction={handleJourneyDetailAction}
      calloutActions={
        activeRoadmapStage?.callout === "assign-agent-y" ? (
          <button type="button" onClick={agentYAssigned ? undefined : handleOpenAssignAgentYPreview} disabled={agentYAssigned}
            className={`inline-flex items-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 transition-colors ${agentYAssigned ? "bg-emerald-100 text-emerald-800 cursor-default" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
            {agentYAssigned ? <CheckCircle size={15} /> : <Send size={15} />}
            {agentYAssigned ? "Assigned" : "Assign Agent Y"}
          </button>
        ) : null
      }
      advanceLabel={activeRoadmapStage?.action?.label ?? "Advance"}
      onAdvance={handleAdvanceAction}
      onStepSelect={handleStepSelect}
    />

      {activeRoadmapStage?.id === "pending-documents-triggers" ? (
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Triggers and Pending Documents and survey reports</h3>
              <p className="mt-1 text-sm text-slate-500">Separate cards for each category below the roadmap, including a survey reports workspace.</p>
            </div>

            <div className="space-y-4">
              {pendingDocumentsJourneyGroups.map((group) =>
                group.items.length > 0 ? (
                  <div key={group.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                    <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 ring-1 ring-slate-200">
                      {group.label}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {group.items.map((item) =>
                        typeof item === "string" ? (
                          <div key={`${group.label}-${item}`} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800">{item}</div>
                        ) : (
                          (() => {
                            const isReceived = item.selectedAction === "received"
                            const isAgentZIntelligenceCard = item.id.startsWith("trigger-")
                            const cardClasses = isAgentZIntelligenceCard
                              ? "border-slate-900/70 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.85)]"
                              : isReceived
                                ? "border-emerald-200 bg-emerald-50/80"
                                : "border-rose-200 bg-rose-50/80"
                            return (
                              <div key={`${group.label}-${item.id}`} className={`rounded-2xl border px-3 py-3 ${cardClasses}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    {isAgentZIntelligenceCard ? (
                                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                                        Agent Z  Planning Intelligence
                                      </p>
                                    ) : null}
                                    <p
                                      className={`mt-1 text-xs ${
                                        isAgentZIntelligenceCard
                                          ? "text-white"
                                          : isReceived
                                            ? "text-emerald-900"
                                            : "text-rose-900"
                                      }`}
                                    >
                                      {item.label}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                      isAgentZIntelligenceCard
                                        ? isReceived
                                          ? "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/20"
                                          : "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/30"
                                        : isReceived
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {isReceived ? "Received" : "Awaiting"}
                                  </span>
                                </div>
                                {"details" in item && Array.isArray(item.details) && item.details.length > 0 ? (
                                  <div className={`mt-3 space-y-1.5 rounded-xl border p-3 ${isAgentZIntelligenceCard ? "border-white/10 bg-white/5" : "border-white/60 bg-white/70"}`}>
                                    {item.details.map((detail, index) => (
                                      <p
                                        key={`${item.id}-detail-${index}`}
                                        className={`text-xs leading-5 ${
                                          agentZTriggerHeadlines.has(detail)
                                            ? isAgentZIntelligenceCard
                                              ? "inline-flex rounded-full bg-cyan-400/15 px-3 py-1 font-bold uppercase tracking-[0.18em] text-cyan-100 ring-1 ring-cyan-300/25"
                                              : "inline-flex rounded-full bg-slate-900/5 px-3 py-1 font-bold uppercase tracking-wide text-slate-900"
                                            : detail === "Property moves from C3 (single dwelling) -> C4 (small HMO)" ||
                                              detail === "5 or more occupants"
                                            ? isAgentZIntelligenceCard
                                              ? "font-bold text-white"
                                              : "font-semibold text-slate-900"
                                            : isAgentZIntelligenceCard
                                              ? "font-semibold text-slate-200"
                                              : "font-semibold text-slate-700"
                                        }`}
                                      >
                                        {detail === "New partitions or walls are added" ||
                                        detail === "Fire doors are installed" ||
                                        detail === "Loft conversion is involved" ||
                                        detail === "New bathrooms or kitchens are added"
                                          ? `• ${detail}`
                                          : detail}
                                      </p>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            )
                          })()
                        )
                      )}
                    </div>
                  </div>
                ) : null
              )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <div>
                    <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 ring-1 ring-slate-200">
                      Survey Reports
                    </p>
                    <h4 className="text-sm font-bold text-slate-900">Survey files and booked survey details</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Click Preview to open the popup and view the document content.
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-600" />
                      <p className="text-sm font-bold text-slate-900">Application and Survey Details</p>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Applicant Name</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{surveyApplicantNameDisplay}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Applicant Email</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{surveyApplicantEmailDisplay}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Applicant Phone</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{surveyApplicantPhoneDisplay}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Survey Date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{surveyDateDisplay}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Survey Time</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{surveyTimeDisplay}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Application Location</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{surveyFullLocationDisplay}</p>
                      </div>
                    </div>
                  </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Linked Survey Files</p>
                        <p className="mt-1 text-xs text-slate-500">Survey plans and document files linked to this booked survey.</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                        {surveyReportLinkedFiles.length} linked
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {surveyReportLinkedFiles.length > 0 ? (
                        surveyReportLinkedFiles.map((item) => (
                        <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {item.fileName ?? "No linked file yet"}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                <span className={`rounded-full px-2.5 py-1 font-semibold ${item.href ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                  {item.status}
                                </span>
                                <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
                                  {item.fileType ?? "-"}
                                </span>
                                {item.source ? (
                                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
                                    {item.source}
                                  </span>
                                ) : null}
                              </div>
                             
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewDocument(item)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                              >
                                <Eye size={13} />
                                Preview
                              </button>
                              {item.href ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDocument(item)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                                >
                                  <ExternalLink size={13} />
                                  Open
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          No linked survey files available yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Post-Survey PDF Uploads</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Upload the survey files for {surveyFullLocationDisplay} from {surveyDateDisplay}. Multiple files are allowed.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenSurveyUpload}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        <Upload size={13} />
                        Upload PDFs
                      </button>
                    </div>

                    <input
                      ref={surveyUploadInputRef}
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleSurveyReportUpload}
                      className="hidden"
                    />

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-slate-500">Expected files:</p>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        Site measurement
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        Original layout
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {surveyReportUploadedPdfFiles.length > 0 ? (
                        surveyReportUploadedPdfFiles.map((item, index) => (
                          <div
                            key={`${item.fileName ?? item.label}-${item.uploadedAt ?? index}`}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">{item.fileName ?? item.label}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                                    {item.status}
                                  </span>
                                  {item.fileType ? (
                                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
                                      {item.fileType}
                                    </span>
                                  ) : null}
                                  {item.fileSize ? (
                                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
                                      {item.fileSize}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                  Uploaded {item.uploadedAt ?? "-"} by Agent X
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(item)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                  <Eye size={13} />
                                  Preview
                                </button>
                                {item.status !== "Submitted" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitSurveyUpload(item.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                                  >
                                    <Send size={13} />
                                    Submit to CAD Department
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                                    <CheckCircle size={13} />
                                    Submitted
                                  </span>
                                )}
                                {item.href ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocument(item)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                                  >
                                    <ExternalLink size={13} />
                                    Open
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          No post-survey PDF documents uploaded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeRoadmapStage?.id === "Briefcase-x" ? (
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">REDACTED BRIEFCASE FOR AGENT Y</h3>
              <p className="mt-1 text-sm font-semibold text-slate-700">Mandatory HMO Licence + Planning Permission (Newham Council)</p>
              <p className="mt-1 text-sm text-slate-500">No personal data. Technical content only.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {/* 1. DOCUMENTATION BRIEFCASE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={16} className="text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">Documentation Briefcase</h4>
                </div>
                <div className="space-y-2 flex-1">
                  {documentationItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border px-3 py-2 text-xs">
                      <span className="text-slate-700 font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          item.status === "Received" || item.status === "Provided" ? "text-emerald-700" : 
                          item.status === "Awaiting Response" ? "text-rose-600" : "text-slate-500"
                        }`}>{item.status}</span>
                        <button
                          type="button"
                          onClick={() => handleViewDocument(item)}
                          className="inline-flex items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-bold mb-1">Notes for Agent Y</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Review technical validity only (dates, ratings, compliance).</li>
                    <li>Flag any invalid or expired documents.</li>
                    <li>Identify missing items requiring follow‑up via Agent X.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendBriefcase("documentation")}
                  disabled={briefcaseSent.documentation}
                  className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    briefcaseSent.documentation
                      ? "bg-emerald-100 text-emerald-800 cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {briefcaseSent.documentation ? <CheckCircle size={16} /> : <Send size={16} />}
                  {briefcaseSent.documentation
                    ? "Documentation Briefcase Sent"
                    : "Send Documentation Briefcase to Agent Y"}
                </button>
              </div>

              {/* 2. COMPLIANCE BRIEFCASE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Compliance Briefcase</h4>
                </div>
                <div className="space-y-3 flex-1 text-xs">
                  {/* Fire Safety */}
                  <div>
                    <p className="font-semibold text-slate-500 mb-1">Fire Safety</p>
                    {complianceItems.filter(i => i.group === "Fire Safety").map(item => (
                       <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border px-3 py-1.5 mb-1">
                         <span className="text-slate-700">{item.label}</span>
                         <div className="flex items-center gap-2">
                           <span className={`font-semibold ${
                             item.status === "Provided" || item.status === "Confirmed" || item.status === "Compliant" ? "text-emerald-700" : 
                             item.status === "Awaiting Response" || item.status === "Unconfirmed" ? "text-rose-600" : "text-slate-500"
                           }`}>{item.status}</span>
                           <button
                             type="button"
                             onClick={() => handleViewDocument(item)}
                             className="inline-flex items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                           >
                             <Eye size={12} />
                             View
                           </button>
                         </div>
                       </div>
                    ))}
                  </div>
                  {/* Amenities */}
                  <div>
                    <p className="font-semibold text-slate-500 mb-1">Amenities</p>
                    {complianceItems.filter(i => i.group === "Amenities").map(item => (
                       <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border px-3 py-1.5 mb-1">
                         <span className="text-slate-700">{item.label}</span>
                         <div className="flex items-center gap-2">
                           <span className={`font-semibold ${item.status === "Pass" ? "text-emerald-700" : "text-amber-600"}`}>{item.status}</span>
                           <button
                             type="button"
                             onClick={() => handleViewDocument(item)}
                             className="inline-flex items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                           >
                             <Eye size={12} />
                             View
                           </button>
                         </div>
                       </div>
                    ))}
                  </div>
                  {/* Environmental */}
                  <div>
                    <p className="font-semibold text-slate-500 mb-1">Environmental</p>
                    {complianceItems.filter(i => i.group === "Environmental").map(item => (
                       <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border px-3 py-1.5 mb-1">
                         <span className="text-slate-700">{item.label}</span>
                         <div className="flex items-center gap-2">
                           <span className={`font-semibold ${
                             item.status === "Verified" || item.status === "Compliant" ? "text-emerald-700" : 
                             item.status === "Unverified" ? "text-rose-600" : "text-slate-500"
                           }`}>{item.status}</span>
                           <button
                             type="button"
                             onClick={() => handleViewDocument(item)}
                             className="inline-flex items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                           >
                             <Eye size={12} />
                             View
                           </button>
                         </div>
                       </div>
                    ))}
                  </div>
                  {/* Space Standards */}
                  <div>
                    <p className="font-semibold text-slate-500 mb-1">Space Standards</p>
                    {complianceItems.filter(i => i.group === "Space Standards").map(item => (
                       <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border px-3 py-1.5 mb-1">
                         <span className="text-slate-700">{item.label}</span>
                         <div className="flex items-center gap-2">
                           <span className={`font-semibold ${item.status === "Pass" ? "text-emerald-700" : "text-amber-600"}`}>{item.status}</span>
                           <button
                             type="button"
                             onClick={() => handleViewDocument(item)}
                             className="inline-flex items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                           >
                             <Eye size={12} />
                             View
                           </button>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-bold mb-1">Compliance Notes for Agent Y</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Highlight any non‑compliant areas.</li>
                    <li>Identify missing evidence (photos, measurements, certificates).</li>
                    <li>Flag high‑risk issues (fire safety, drainage, overcrowding).</li>
                    <li>Provide technical recommendations for Agent X to relay.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendBriefcase("compliance")}
                  disabled={briefcaseSent.compliance}
                  className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    briefcaseSent.compliance
                      ? "bg-emerald-100 text-emerald-800 cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {briefcaseSent.compliance ? <CheckCircle size={16} /> : <Send size={16} />}
                  {briefcaseSent.compliance
                    ? "Compliance Briefcase Sent"
                    : "Send Compliance Briefcase to Agent Y"}
                </button>
              </div>

              {/* 3. DRAWINGS BRIEFCASE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler size={16} className="text-amber-600" />
                  <h4 className="text-sm font-bold text-slate-900">Drawings Briefcase</h4>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-[11px] font-semibold text-slate-500">Required Drawing Set</p>
                  {drawingItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border px-3 py-2 text-xs">
                      <span className="text-slate-700 font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${item.status === "Provided" ? "text-emerald-700" : "text-rose-600"}`}>{item.status}</span>
                        <button
                          type="button"
                          onClick={() => handleViewDocument(item)}
                          className="inline-flex items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <p className="text-[11px] font-semibold text-slate-500 pt-2">Inputs Provided</p>
                  {drawingInputs.map((item) => (
                     <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border px-3 py-2 text-xs">
                       <span className="text-slate-700 font-medium">{item.label}</span>
                       <div className="flex items-center gap-2">
                         <span className={`font-semibold ${
                           item.status === "Complete" || item.status === "Available" || item.status === "Provided" ? "text-emerald-700" : 
                           item.status === "Partial" || item.status === "Pending Measurements" ? "text-amber-600" : "text-rose-600"
                         }`}>{item.status}</span>
                         <button
                           type="button"
                           onClick={() => handleViewDocument(item)}
                           className="inline-flex items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                         >
                           <Eye size={12} />
                           View
                         </button>
                       </div>
                     </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-bold mb-1">Notes for Agent Y</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Verify drawing scales and keys.</li>
                    <li>Check consistency with site measurements.</li>
                    <li>Highlight any missing dimensions or annotation errors.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendBriefcase("drawings")}
                  disabled={briefcaseSent.drawings}
                  className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    briefcaseSent.drawings
                      ? "bg-emerald-100 text-emerald-800 cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {briefcaseSent.drawings ? <CheckCircle size={16} /> : <Send size={16} />}
                  {briefcaseSent.drawings
                    ? "Drawings Briefcase Sent"
                    : "Send Drawings Briefcase to Agent Y"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── MAIN CONTENT WITH SIDEBAR ── */}
      {activeRoadmapStage?.id === "final-review-check" ? (
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">Final Review and Check</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      councilOfficerReportReceived === "yes"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {councilOfficerReportReceived === "yes"
                        ? "Newham Council Report Received"
                        : "Awaiting Newham Council Report"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Review the full checklist and the submitted eligibility data before council submission.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Council Officer Report Received?
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={councilOfficerReportReceived === "yes"}
                        onChange={() => setCouncilOfficerReportReceived((prev) => prev === "yes" ? null : "yes")}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={councilOfficerReportReceived === "no"}
                        onChange={() => setCouncilOfficerReportReceived((prev) => prev === "no" ? null : "no")}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      No
                    </label>
                  </div>
                  {councilOfficerReportReceived === "yes" ? (
                    <button
                      type="button"
                      onClick={handleProceedToFinalSubmission}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <CheckCircle size={14} />
                      Proceed to Final Submission
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            {eligibilityData ? (
              <div className="grid gap-4 xl:grid-cols-3">
                {finalReviewChecklistGroups.map((group) => (
                  <OverviewCard key={group.label} title={`${group.label} Checklist`} icon={group.label === "Documents" ? <FileText size={14} className="text-blue-600" /> : group.label === "Compliance" ? <Shield size={14} className="text-emerald-600" /> : <Ruler size={14} className="text-amber-600" />}>
                    <div className="space-y-2">
                      {group.items.map((item) => (<StatusReviewRow key={`${group.label}-${item.label}`} label={item.label} status={item.status} />))}
                    </div>
                  </OverviewCard>
                ))}
              </div>
            ) : (
              <div className="mt-6"><LiveDataPlaceholder title="Final review data not connected" message="The checklist is ready, and the eligibility answers will appear here once the live project data is available." /></div>
            )}
          </div>
        </div>
      ) : null}

      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
          {/* ── LEFT: CONTENT AREA ── */}
          {activeRoadmapStage?.id !== "pending-documents-triggers" &&
          activeRoadmapStage?.id !== "final-review-check" &&
          activeRoadmapStage?.id !== "Briefcase-x" ? (
          <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
            <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{sectionMeta[activeSection].title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sectionMeta[activeSection].hint}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-white border px-2.5 py-1 text-slate-600">Project {projectId ?? "Unknown"}</span>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-blue-700">Agent X Workspace</span>
                </div>
              </div>
            </div>

            {activeSection === "submission" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">Application Form Submission</h2>
                </div>
                {eligibilityData ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <OverviewCard title="Applicant Details" icon={<User size={14} className="text-blue-600" />}>
                        <div className="space-y-2">{submissionApplicantRows.map((row) => (<InfoPair key={row.label} label={row.label} value={row.value} />))}</div>
                      </OverviewCard>
                      <OverviewCard title="Property Details" icon={<Home size={14} className="text-emerald-600" />}>
                         <div className="space-y-2">{submissionPropertyRows.map((row) => (<InfoPair key={row.label} label={row.label} value={row.value} />))}</div>
                      </OverviewCard>
                    </div>

                    <OverviewCard title="Council Submission Fee" icon={<Banknote size={14} className="text-amber-600" />}>
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Fee Breakdown - Newham Council (2026)</p>
                            <p className="mt-1 text-xs text-slate-500">Approximate council and licensing charges for HMO-related submission work.</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${councilSubmissionFeeStatusClasses}`}>
                            {councilSubmissionFeeStatusLabel}
                          </span>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Category</th>
                                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fee</th>
                                  {/* <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Notes</th> */}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {councilSubmissionFeeItems.map((item) => (
                                  <tr key={item.category} className={item.isTotal ? "bg-amber-50/60" : "bg-white"}>
                                    <td className={`px-4 py-3 text-sm ${item.isTotal ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                                      {item.category}
                                    </td>
                                    <td className={`px-4 py-3 text-sm whitespace-nowrap ${item.isTotal ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                                      {item.fee}
                                    </td>
                                    {/* <td className="px-4 py-3 text-xs leading-relaxed text-slate-500">
                                      {item.notes}
                                    </td> */}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className={`rounded-xl border px-4 py-3 ${councilSubmissionFeeStatus === "paid" ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80"}`}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Council submission total</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {councilSubmissionFeeStatus === "paid"
                                  ? "The core council submission fee has been recorded as paid."
                                  : "The core council submission fee is still due and pending payment."}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-slate-900">Grand Total: {formatCurrencyGBP(1658)}</p>
                          </div>
                        </div>
                      </div>
                    </OverviewCard>

                    <OverviewCard title="Council Ready Submission Pack" icon={<FileText size={14} className="text-blue-600" />}>
                      <div className="space-y-3">
                        {councilReadySubmissionPackItems.map((item) => (
                          <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                <p className="mt-1 truncate text-xs text-slate-500">{item.fileName ?? "-"}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                                    {item.status}
                                  </span>
                                  {item.fileType ? (
                                    <span className="rounded-full bg-slate-50 px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
                                      {item.fileType}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(item)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                  <Eye size={13} />
                                  Preview
                                </button>
                                {item.href ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocument(item)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                                  >
                                    <ExternalLink size={13} />
                                    Open
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleProceedToFinalSubmission}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                          >
                            Submit to Council
                          </button>
                        </div>
                      </div>
                    </OverviewCard>
                  </div>
                ) : (<LiveDataPlaceholder title="Submission data not connected" message="This section will show the submitted application details once a live project form endpoint is connected." />)}
              </div>
            )}

            {activeSection === "dimensions" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Project Dimensions</h2>
                </div>
                {eligibilityData ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <OverviewCard title="Dimensions" icon={<Ruler size={14} className="text-blue-600" />}>
                      <div className="space-y-2">{dimensionsRows.map((row) => (<InfoPair key={row.label} label={row.label} value={row.value} />))}</div>
                    </OverviewCard>
                    <OverviewCard title="Materials + Drawings" icon={<Building2 size={14} className="text-amber-600" />}>
                      <div className="space-y-2">{materialsRows.map((row) => (<InfoPair key={row.label} label={row.label} value={row.value} />))}</div>
                    </OverviewCard>
                  </div>
                ) : (<LiveDataPlaceholder title="Dimension data not connected" message="Live dimension and drawing details will appear here when available from the project APIs." />)}
              </div>
            )}

            {activeSection === "constraints" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">Planning Constraints</h2>
                </div>
                {eligibilityData ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <OverviewCard title="Site Constraints" icon={<AlertTriangle size={14} className="text-amber-600" />}>
                      <div className="space-y-2">{constraintRows.map((row) => (<InfoPair key={row.label} label={row.label} value={row.value} />))}</div>
                    </OverviewCard>
                    <OverviewCard title="Trees + Consents" icon={<TreePine size={14} className="text-emerald-600" />}>
                      <div className="space-y-2">{constraintSupportRows.map((row) => (<InfoPair key={row.label} label={row.label} value={row.value} />))}</div>
                    </OverviewCard>
                  </div>
                ) : (<LiveDataPlaceholder title="Constraint data not connected" message="This section now avoids hardcoded planning constraints and will only show live values." />)}
              </div>
            )}

            {activeSection === "consultation" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Consultation Booking</h2>
                </div>
                <LiveDataPlaceholder title="Consultation data not connected" message="The previous hardcoded consultation booking has been removed. This section will show real consultation details once that API is wired in." />
              </div>
            )}

            {/* COORDINATION HUB */}
            {activeSection === "coordination" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Agent X Mediation Workflow</h2>
                </div>
                <div className="rounded-xl border bg-white p-5 mb-6">
                  <p className="text-sm font-bold text-slate-900 mb-4">Document Request Flow</p>
                  <div className="grid md:grid-cols-5 gap-3">
                    <FlowStepCard step="1" title="Agent Y Request" desc="Agent Y marks missing project document." status="done" />
                    <FlowStepCard step="2" title="Agent X Review" desc="Agent X verifies request and required file list." status="done" />
                    <FlowStepCard step="3" title="Contact Customer" desc="Agent X asks customer for required documents." status="in_progress" />
                    <FlowStepCard step="4" title="Validation" desc="Agent X checks file quality/completeness." status="pending" />
                    <FlowStepCard step="5" title="Share to Agent Y" desc="Agent X sends verified files for next action." status="pending" />
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-4 mb-6">
                  <OverviewCard title="Customer Request State" icon={<Upload size={14} className="text-blue-600" />}>
                    <div className="space-y-2">
                      <InfoPair label="Project" value={projectId ?? "Unknown"} />
                      <InfoPair label="Docs Requested From Customer" value={requiredForCustomer.length} />
                    </div>
                  </OverviewCard>
                  <OverviewCard title="Agent Y Handover State" icon={<Bot size={14} className="text-amber-600" />}>
                    <div className="space-y-2">
                      <InfoPair label="Checklist Items" value={documentState.checklist.length} />
                      <InfoPair label="Missing Docs Sent To Agent X" value={Boolean(missingDocsSentLog)} />
                    </div>
                  </OverviewCard>
                </div>
              </div>
            )}

            {/* PROJECT OVERVIEW */}
            {activeSection === "project" && (
              <div>
                {(activeRoadmapStage?.id === "checklist" || activeRoadmapStage?.id === "eligibility-check") && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileCheck size={18} className="text-blue-600" />
                      <h2 className="text-lg font-bold text-slate-900">{activeRoadmapStage?.id === "checklist" ? "SOP" : "Eligibility Check"}</h2>
                    </div>
                    <EligibilityDetailsCard eligibilityData={eligibilityData} loading={eligibilityLoading} projectId={projectId} viewMode={activeRoadmapStage?.id === "checklist" ? "checklist" : "eligibility"} />
                  </div>
                )}
              </div>
            )}

            {/* REQUIREMENTS */}
            {activeSection === "requirements" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Client Requirements</h2>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Selected Service</p><p className="text-base font-bold text-slate-900">{project.service}</p></div>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Active Service</span>
                  </div>
                  <p className="text-xs text-slate-500">Service ID · {project.serviceNo}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <MetaBox icon={<Building2 size={14} className="text-blue-500" />} label="Service Name" value="Mandatory HMO License" />
                  <MetaBox icon={<MapPin size={14} className="text-rose-500" />} label="Location Type" value={requirements.locationType} />
                  <MetaBox icon={<Clock size={14} className="text-amber-500" />} label="Timeline" value={requirements.timeline} />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5"><CheckCircle size={13} className="text-emerald-500" />Scope of Work</p>
                    <ul className="space-y-2">{requirements.scope.map((s, i) => (<li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{s}</li>))}</ul>
                  </div>
                  <div className="rounded-xl border bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-900 mb-3 flex items-center gap-1.5"><AlertTriangle size={13} className="text-amber-600" />Constraints</p>
                    <ul className="space-y-2">{requirements.constraints.map((c, i) => (<li key={i} className="text-sm text-amber-900 flex items-start gap-2"><span className="text-amber-600 mt-0.5">•</span>{c}</li>))}</ul>
                  </div>
                </div>
              </div>
            )}

            {/* QUOTE SUMMARY */}
            {activeSection === "quote" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Banknote size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Payments (Generate a Quote)</h2>
                </div>
                {/* Quote History Table */}
                {quoteHistory.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3"><History size={16} className="text-slate-500" /><h3 className="text-sm font-bold text-slate-700">Recent Generated Quotes</h3></div>
                    <div className="bg-white border rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600">Client Name</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600">Amount</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                            <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {quoteHistory.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-medium text-slate-800">{q.clientName}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">{q.amount}</td>
                              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${q.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{q.status}</span></td>
                              <td className="px-4 py-3 text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right space-x-2">
                                <button onClick={() => handleViewQuote(q)} className="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-slate-50 text-slate-700 font-medium"><Eye size={12} />View</button>
                                <button onClick={() => handleSendToCustomer(q.id)} disabled={q.status === 'Sent'} className={`inline-flex items-center gap-1 px-2 py-1 rounded font-medium ${q.status === 'Sent' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}><Send size={12} />{q.status === 'Sent' ? 'Sent' : 'Send'}</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <OverviewCard title="Subscription Payment Details" icon={<Banknote size={14} className="text-emerald-600" />}>
                    <div className="space-y-2">
                      <InfoPair label="Service Name" value={subscriptionPayment.serviceName} />
                      <InfoPair label="Customer Name" value={subscriptionPayment.customerName} />
                      <InfoPair label="Subscription" value={subscriptionPayment.subscription} />
                    </div>
                  </OverviewCard>
                  <OverviewCard title="Payment Record" icon={<CheckCircle size={14} className="text-blue-600" />}>
                    <div className="space-y-2">
                      <InfoPair label="Payment Date" value={subscriptionPayment.paymentDate} />
                      <InfoPair label="Amount" value={subscriptionPayment.amount} />
                      <InfoPair label="Status" value={subscriptionPayment.status} />
                    </div>
                  </OverviewCard>
                </div>

                <div className="rounded-xl bg-blue-600 text-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Subscription Plan Amount</p>
                    <p className="text-2xl font-bold">{subscriptionPayment.amount}</p>
                  </div>
                </div>
                
                {/* Quote Builder UI */}
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border p-5 mt-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Services Added to Cart</p>
                      <p className="text-xs text-slate-500">
                        {quoteGenerated
                          ? "The current quote has already been generated. Add new services to start a fresh cart."
                          : "Build the quote from document, compliance, drawing, and trigger-related services."}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${quoteGenerated ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{quoteStatusLabel}</span>
                  </div>
                  {cartLoading || quotationsLoading ? (
                    <p className="text-sm text-slate-500">Loading payment-stage services...</p>
                  ) : cartError ? (
                    <p className="text-sm text-rose-600">{cartError}</p>
                  ) : addServiceError ? (
                    <p className="text-sm text-rose-600">{addServiceError}</p>
                  ) : quoteSubmitError ? (
                    <p className="text-sm text-rose-600">{quoteSubmitError}</p>
                  ) : null}
                </div>

                <div className="space-y-3 mb-6">
                  {quoteServices.length === 0 && !cartLoading && !quotationsLoading ? (
                    <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      {quoteGenerated
                        ? "Quote already generated. Add new services below to create the next cart."
                        : "No payment-stage services are available for this project yet."}
                    </div>
                  ) : quoteServices.map((service) => (
                    <div key={service.id} className="rounded-xl border bg-slate-50 px-4 py-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          {editingServiceId === service.id ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 border">{service.category}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${service.status === "Ready" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{service.status}</span>
                              </div>
                              <input
                                type="text"
                                value={editServiceName}
                                onChange={(e) => setEditServiceName(e.target.value)}
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                              />
                              <p className="text-sm leading-6 text-slate-600">{service.about}</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900">{service.title}</p>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 border">{service.category}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${service.status === "Ready" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{service.status}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{service.about}</p>
                            </>
                          )}
                        </div>
                        <div className="flex items-start gap-3">
                          {editingServiceId === service.id ? (
                            <>
                              <div className="text-right">
                                <p className="text-[11px] uppercase text-slate-400">Amount</p>
                                <input
                                  type="number"
                                  value={editServiceAmount}
                                  onChange={(e) => setEditServiceAmount(e.target.value)}
                                  className="mt-1 w-28 rounded-lg border bg-white px-3 py-2 text-right text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditService(service.id)}
                                  disabled={editServiceSubmitting}
                                  className={`rounded-md px-3 py-2 text-xs font-semibold transition ${editServiceSubmitting ? "cursor-not-allowed bg-blue-200 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                                >
                                  {editServiceSubmitting ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditService}
                                  disabled={editServiceSubmitting}
                                  className="rounded-md border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-right"><p className="text-[11px] uppercase text-slate-400">Amount</p><p className="text-base font-bold text-slate-900">{service.amount}</p></div>
                              <button type="button" onClick={() => handleStartEditService(service)} className="p-2 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"><Pencil size={16} /></button>
                              <button type="button" onClick={() => handleDeleteService(service.id)} className="p-2 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4 rounded-lg border bg-white p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Add New Service</p>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input type="text" placeholder="Service name" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" placeholder="Amount" value={newServiceAmount} onChange={(e) => setNewServiceAmount(e.target.value)} className="w-40 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={handleAddService} disabled={addServiceSubmitting || !projectId || !resolvedProjectUserId} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${addServiceSubmitting || !projectId || !resolvedProjectUserId ? "cursor-not-allowed bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}>{addServiceSubmitting ? "Adding..." : "Add"}</button>
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-sm font-semibold text-slate-900">Quote Total</p><p className="text-xs text-slate-500">Survey, gas, tree, documents, and drawings services included.</p></div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-slate-900">{quoteCartTotal}</p>
                    {quoteGenerated ? (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                        <CheckCircle size={14} /> Quote Generated
                      </div>
                    ) : (
                      <button type="button" onClick={handleCreateQuote} disabled={quoteServices.length === 0 || quoteSubmitting || !serviceCart?.cartId || !resolvedProjectUserId} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition bg-blue-600 text-white hover:bg-blue-700 ${quoteServices.length === 0 || quoteSubmitting || !serviceCart?.cartId || !resolvedProjectUserId ? "cursor-not-allowed opacity-60" : ""}`}>
                        <Banknote size={14} /> {quoteSubmitting ? "Saving Quote..." : "Generate Quote"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "documents" && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-600">Document Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleRequestDocuments} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"><Send size={13} />Send to Client</button>
                    <button type="button" className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"><Upload size={13} />Upload Manually</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "communication" && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-slate-50 p-6">
                  <p className="text-sm font-semibold text-slate-900">Project Communication Channels</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Each project has its own dedicated chat history for Agent X with the customer and Agent Y.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link href={`/projects/${id}/workspace/customer-chat`} className="rounded-xl border bg-white p-5 transition hover:border-blue-200 hover:shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Customer Chat</p>
                    <p className="mt-2 text-sm text-slate-500">Direct Agent X to customer conversation for this specific project.</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-blue-600">Open Customer Chat</span>
                  </Link>
                  <Link href={`/projects/${id}/workspace/agent-y-chat`} className="rounded-xl border bg-white p-5 transition hover:border-blue-200 hover:shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Agent Y Chat</p>
                    <p className="mt-2 text-sm text-slate-500">Private coordination channel between Agent X and Agent Y for this project.</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-blue-600">Open Agent Y Chat</span>
                  </Link>
                </div>
              </div>
            )}

            {activeSection === "profile" && (
              <div>
                <div className="flex items-center gap-2 mb-5"><User size={18} className="text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Customer Profile</h2></div>
                <div className="space-y-3">
                  <ProfileRow icon={<Phone size={13} className="text-blue-500" />} label="Phone" value={customer.phone} />
                  <ProfileRow icon={<Mail size={13} className="text-emerald-500" />} label="Email" value={customer.email} />
                  <ProfileRow icon={<MapPin size={13} className="text-rose-500" />} label="Location" value={customer.location} />
                </div>
              </div>
            )}

       {activeSection === "payments" && (
  <div className="space-y-6">
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Banknote size={18} className="text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Payments</h2>
      </div>
    </div>

    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Council Fee Rows</p>
          <p className="text-xs text-slate-500 mt-1">
            Add amount details and payment amounts, then generate the quotation.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setCouncilFeeRows((prev) => [
              ...prev,
              { id: `fee-${Date.now()}`, label: "", amount: "" },
            ])
          }
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white hover:bg-blue-700"
        >
          +
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {councilFeeRows.map((row) => (
          <div key={row.id} className="grid gap-4 rounded-xl border bg-slate-50 p-4 md:grid-cols-[1.6fr_0.8fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amount Details</label>
              <input
                value={row.label}
                onChange={(e) =>
                  setCouncilFeeRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id ? { ...item, label: e.target.value } : item
                    )
                  )
                }
                placeholder="e.g. Counseling Payment"
                disabled={councilFeeSubmitted}
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
              <input
                type="number"
                value={row.amount}
                onChange={(e) =>
                  setCouncilFeeRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id ? { ...item, amount: e.target.value } : item
                    )
                  )
                }
                placeholder="e.g. 2500"
                disabled={councilFeeSubmitted}
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-end">
              {councilFeeRows.length > 1 && !councilFeeSubmitted ? (
                <button
                  type="button"
                  onClick={() =>
                    setCouncilFeeRows((prev) =>
                      prev.filter((item) => item.id !== row.id)
                    )
                  }
                  className="p-3 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <div className="p-3 w-[46px]" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Validation summary */}
      {councilFeeRows.some((row) => row.label.trim() !== "" || row.amount.trim() !== "") &&
        !councilFeeRows.some((row) => row.label.trim() !== "" && row.amount.trim() !== "" && Number(row.amount) > 0) && (
          <p className="mt-3 text-xs text-amber-600 font-medium">
            Please fill in both Amount Details and a valid Amount for at least one row.
          </p>
        )}

      {/* Error message */}
      {councilFeeSubmitError && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {councilFeeSubmitError}
        </div>
      )}

      {/* Services summary before submission */}
      {councilFeeRows.filter(
        (row) =>
          row.label.trim() !== "" &&
          row.amount.trim() !== "" &&
          Number.isFinite(Number(row.amount)) &&
          Number(row.amount) > 0
      ).length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Quotation Summary
          </p>
          <div className="space-y-2">
            {councilFeeRows
              .filter(
                (row) =>
                  row.label.trim() !== "" &&
                  row.amount.trim() !== "" &&
                  Number.isFinite(Number(row.amount)) &&
                  Number(row.amount) > 0
              )
              .map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-lg bg-white border px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-700">{row.label}</span>
                  <span className="text-sm font-bold text-slate-900">
                    {Number(row.amount)} GBP
                  </span>
                </div>
              ))}
            <div className="flex items-center justify-between border-t border-blue-200 pt-2 mt-2">
              <span className="text-sm font-bold text-slate-800">Total</span>
              <span className="text-sm font-bold text-blue-700">
                {councilFeeRows
                  .filter(
                    (row) =>
                      row.label.trim() !== "" &&
                      row.amount.trim() !== "" &&
                      Number.isFinite(Number(row.amount)) &&
                      Number(row.amount) > 0
                  )
                  .reduce((sum, row) => sum + Number(row.amount), 0)}{" "}
                GBP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Generate Quotation button */}
      <div className="mt-6 border-t pt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Council Fee Quotation</p>
          <p className="text-xs text-slate-500">
            {councilFeeSubmitted
              ? "Quotation has been generated successfully."
              : "Generate a quotation for the council fee payment rows above."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {councilFeeSubmitted ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-800">
              <CheckCircle size={16} />
              Quotation Generated
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGenerateCouncilQuotation}
              disabled={
                councilFeeSubmitting ||
                !projectId ||
                !resolvedProjectUserId ||
                !councilFeeRows.some(
                  (row) =>
                    row.label.trim() !== "" &&
                    row.amount.trim() !== "" &&
                    Number.isFinite(Number(row.amount)) &&
                    Number(row.amount) > 0
                )
              }
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                councilFeeSubmitting ||
                !projectId ||
                !resolvedProjectUserId ||
                !councilFeeRows.some(
                  (row) =>
                    row.label.trim() !== "" &&
                    row.amount.trim() !== "" &&
                    Number.isFinite(Number(row.amount)) &&
                    Number(row.amount) > 0
                )
                  ? "cursor-not-allowed bg-blue-300 text-white/80"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Banknote size={14} />
              {councilFeeSubmitting ? "Generating Quotation..." : "Generate Quotation"}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
            {activeSection === "notes" && (
              <div>
                <div className="flex items-center gap-2 mb-5"><StickyNote size={18} className="text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Internal Notes</h2></div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                  {notes.map((n, i) => (<div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-3.5 py-2.5 text-sm text-amber-900 leading-relaxed">{n}</div>))}
                </div>
                <div className="flex gap-2">
                  <input value={noteText} onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} placeholder="Add internal note…" className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200" />
                  <button onClick={addNote} className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Add</button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Lock size={10} />Never shared externally</p>
              </div>
            )}
          </div>
          ) : null}
        </div>
      </div>

      {/* HANDOVER ORCHESTRATION ANIMATION */}
      <Dialog open={showHandoverAnimation} onOpenChange={setShowHandoverAnimation}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden max-h-[92vh]" showCloseButton={false}>
          {/* ... Content unchanged ... */}
        </DialogContent>
      </Dialog>

      {/* ASSIGN AGENT Y PREVIEW MODAL */}
      <Dialog open={open} onOpenChange={handleAssignDialogOpenChange}>
        <DialogContent className="w-[95vw] max-w-5xl p-0 overflow-hidden max-h-[92vh]" showCloseButton={false}>
           {/* ... Content unchanged ... */}
        </DialogContent>
      </Dialog>

      {/* VIEW QUOTE MODAL */}
      <Dialog open={!!viewingQuote} onOpenChange={() => setViewingQuote(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="bg-white max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2"><FileText size={18} className="text-blue-600" /><DialogTitle className="text-lg font-bold text-slate-900">Quote Details</DialogTitle></div>
              <button onClick={() => setViewingQuote(null)} className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {viewingQuote && (
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                  <div><p className="text-[10px] font-semibold uppercase text-slate-400">Client Name</p><p className="text-sm font-bold text-slate-900">{viewingQuote.clientName}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase text-slate-400">Date Created</p><p className="text-sm font-bold text-slate-900">{new Date(viewingQuote.createdAt).toLocaleDateString()}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase text-slate-400">Total Amount</p><p className="text-sm font-bold text-blue-700">{viewingQuote.amount}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase text-slate-400">Status</p><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${viewingQuote.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{viewingQuote.status}</span></div>
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Services</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50"><tr><th className="text-left px-3 py-2 font-semibold text-slate-600">Service</th><th className="text-right px-3 py-2 font-semibold text-slate-600">Amount</th></tr></thead>
                    <tbody className="divide-y">
                      {viewingQuote.services.map((s) => (<tr key={s.id}><td className="px-3 py-2 text-slate-800">{s.title}</td><td className="px-3 py-2 text-right font-semibold text-slate-900">{s.amount}</td></tr>))}
                      <tr className="bg-slate-50 font-bold"><td className="px-3 py-2 text-slate-800">Total</td><td className="px-3 py-2 text-right text-blue-700">{viewingQuote.amount}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setViewingQuote(null)} className="rounded-lg px-4 py-2 text-sm font-semibold border bg-white hover:bg-slate-50 text-slate-700">Close</button>
              <button onClick={() => generateInvoicePDF(viewingQuote)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"><Download size={14} />Download PDF</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCouncilSubmissionDialog} onOpenChange={setShowCouncilSubmissionDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-white">
            <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
              <DialogTitle className="text-lg font-bold text-slate-900">Submission Status</DialogTitle>
              <button
                onClick={() => setShowCouncilSubmissionDialog(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-xl leading-6 text-slate-700">
                Thank you. Your form has been submitted successfully.
              </p>
            </div>
            <div className="flex justify-end border-t bg-slate-50 px-6 py-4">
              <button
                onClick={() => setShowCouncilSubmissionDialog(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="w-[99vw] max-w-7xl p-0 overflow-hidden">
          <div className="bg-white max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Document Preview
                </DialogTitle>
              </div>
              <button
                onClick={() => setViewingDocument(null)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            {viewingDocument ? (
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                {viewingDocument.previewHref?.endsWith(".html") ? (
                  <div className="overflow-hidden rounded-2xl border bg-slate-50 shadow-sm">
                    <iframe
                      title={viewingDocument.label}
                      src={viewingDocument.previewHref}
                      className="h-[80vh] w-full bg-white"
                    />
                  </div>
                ) : viewingDocument.previewHref?.endsWith(".pdf") ? (
                  <div className="overflow-hidden rounded-2xl border bg-slate-50 shadow-sm">
                    <object
                      data={getPdfPreviewSrc(viewingDocument.previewHref)}
                      type="application/pdf"
                      className="h-[80vh] w-full bg-white"
                    >
                      <iframe
                        title={viewingDocument.label}
                        src={getPdfPreviewSrc(viewingDocument.previewHref)}
                        className="h-[80vh] w-full bg-white"
                      />
                    </object>
                  </div>
                ) : viewingDocument.previewHref ? (
                  <div className="rounded-2xl border bg-white shadow-sm">
                    <div className="max-h-[80vh] overflow-y-auto px-5 py-4">
                      {documentPreviewLoading ? (
                        <p className="text-sm text-slate-500">Loading preview...</p>
                      ) : documentPreviewError ? (
                        <p className="text-sm text-rose-600">{documentPreviewError}</p>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
                          {documentPreviewText}
                        </pre>
                      )}
                    </div>
                  </div>
                ) : viewingDocument.href && viewingDocument.fileType === ".pdf" ? (
                  <div className="overflow-hidden rounded-2xl border bg-slate-50 shadow-sm">
                    <object
                      data={getPdfPreviewSrc(viewingDocument.href)}
                      type="application/pdf"
                      className="h-[80vh] w-full bg-white"
                    >
                      <iframe
                        title={viewingDocument.label}
                        src={getPdfPreviewSrc(viewingDocument.href)}
                        className="h-[80vh] w-full bg-white"
                      />
                    </object>
                  </div>
                ) : (
                  <div className="rounded-2xl border bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-slate-700">
                      {viewingDocument.note ??
                        "This document does not have an in-app preview yet. Use Open to access the original file when available."}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
            <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-3">
              {viewingDocument?.href ? (
                <button
                  onClick={() => handleOpenDocument(viewingDocument)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink size={14} />
                  Open Original
                </button>
              ) : null}
              <button
                onClick={() => setViewingDocument(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold border bg-white hover:bg-slate-50 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function LiveDataPlaceholder({ title, message }: { title: string; message: string }) {
  return (<div className="rounded-xl border bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-2 text-sm text-slate-500">{message}</p></div>)
}

function MaskField({ label, value }: { label: string; value: string }) {
  return (<div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</p><div className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700">{value}</div></div>)
}

function ProtectedDocumentCard() {
  return (<div className="rounded-lg border bg-white px-3 py-2.5 flex items-center gap-2"><FileText size={14} className="text-slate-400" /><div className="flex-1"><div className="h-2.5 w-28 bg-slate-200 rounded" /><div className="h-1.5 w-16 bg-slate-100 rounded mt-1.5" /></div></div>)
}

function PrivacyCheckItem({ title, desc }: { title: string; desc: string }) {
  return (<div className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mt-0.5"><CheckCircle size={14} /></div><div><p className="font-semibold text-slate-900">{title}</p><p className="text-sm text-slate-500">{desc}</p></div></div>)
}

function FlowStepCard({ step, title, desc, status }: { step: string; title: string; desc: string; status: "done" | "in_progress" | "pending" }) {
  const statusStyles = status === "done" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : status === "in_progress" ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-slate-50 border-slate-200 text-slate-700"
  return (<div className={`rounded-xl border p-3 ${statusStyles}`}><div className="flex items-center gap-2 mb-2"><span className="w-5 h-5 rounded-full bg-white/80 border text-[10px] font-bold grid place-items-center">{step}</span><p className="text-xs font-bold">{title}</p></div><p className="text-xs leading-relaxed">{desc}</p></div>)
}

function InfoPair({ label, value }: { label: string; value?: unknown }) {
  return (<div className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2"><span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span><span className="max-w-[60%] text-right text-sm font-semibold text-slate-800">{formatDisplayValue(value)}</span></div>)
}

function MetaBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (<div className="rounded-xl border bg-slate-50 px-3.5 py-2.5"><div className="flex items-center gap-1.5 mb-1">{icon}<p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p></div><p className="text-sm font-semibold text-slate-800">{value}</p></div>)
}

function OverviewCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (<div className="rounded-xl border bg-slate-50 p-4"><div className="flex items-center gap-2 mb-3">{icon}<p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</p></div>{children}</div>)
}

function StatusReviewRow({ label, status }: { label: string; status: ReviewChecklistStatus }) {
  const statusStyles = status === "completed" ? { container: "border-emerald-200 bg-emerald-50/80", text: "text-emerald-900", badge: "bg-emerald-100 text-emerald-700", label: "Checked" } : status === "in-progress" ? { container: "border-amber-200 bg-amber-50/80", text: "text-amber-900", badge: "bg-amber-100 text-amber-700", label: "In Progress" } : { container: "border-rose-200 bg-rose-50/80", text: "text-rose-900", badge: "bg-rose-100 text-rose-700", label: "Pending" }
  return (<div className={`rounded-lg border px-3 py-2.5 ${statusStyles.container}`}><div className="flex items-center justify-between gap-3"><p className={`text-sm font-medium ${statusStyles.text}`}>{label}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles.badge}`}>{statusStyles.label}</span></div></div>)
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (<div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3"><div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">{icon}</div><div><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p><p className="text-sm font-semibold text-slate-800">{value}</p></div></div>)
}

function TeamMember({ label, name }: { label: string; name: string }) {
  return (<div className="rounded-xl border bg-slate-50 px-4 py-3"><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p><p className="text-sm font-semibold text-slate-900">{name}</p></div>)
}
