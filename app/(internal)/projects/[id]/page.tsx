"use client"
import CustomerJourney from "@/components/CustomerJourney"
import Link from "next/link"
import SendToAgentAnimation from "@/components/SendToAgentAnimation"
import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2,
  Lock,
  CheckCircle,
  Clock,
  Send,
  Paperclip,
  Download,
  X,
  ChevronRight,
  Building2,
  Calendar,
  Ruler,
  AlertTriangle,
  MessageSquare,
  File,
  ImageIcon,
  BadgeCheck,
  CircleDot,
  Circle,
  TrendingUp,
  StickyNote,
  Eye,
  EyeOff,
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
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"





const assignedAgentY = "Agent Y – Planning Team A"

const customer = {
  name: "Zafer Khan",
  phone: "0776862279",
  email: "zafer.khan@ai4planning.com",
  location: "42 Brick Lane, London, E1 6RF",
  status: "Active",
}

// NEW: Form submission data from the images
const formSubmission = {
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
  briefDescription: "'Single-storey rear extension with open-plan kitchen-dining and rear glazing.",
  
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

const flow = {
  currentStep: 5,
  steps: [
    { label: "Profile Created", desc: "Account set up" },
    { label: "Service Selected", desc: "HSPC chosen" },
    { label: "£30 Advance Payment", desc: "paid" },
    { label: "Eligibility Check", desc: "Passed" },
    { label: "Consultant Assigned", desc: "In progress" },
    { label: "Quote Submitted", desc: "Awaiting sign-off" },
    { label: "70% Payment Completed", desc: "£6,930 pending" },
    { label: "Project Allocated to Agent Y", desc: "Handoff done" },
    { label: "Council Submission", desc: "Final stage" },
  ],
}

const project = {
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

const requirements = {
  propertyType: "Terraced house",
  locationType: "Residential",
  timeline: "4–6 Months",
  scope: [
    "Single-storey rear extension",
    "Internal layout modification",
  ],
  constraints: [
    "Council height regulations",
    "Neighbour boundary on left",
  ],
  notes: "Client prefers modern elevation and minimal disruption during construction.",
}

const quote = {
  reference: "QT-UK-2219",
  submittedOn: "18 Feb 2026",
  status: "approved",
  total: "£9,900",
  breakdown: [
    { label: "Consultancy", amount: "£4,200", pct: 42 },
    { label: "Drawings", amount: "£3,100", pct: 31 },
    { label: "Council Fees", amount: "£2,600", pct: 27 },
  ],
}

const payments = [
  { label: "30% Advance", amount: "£2,970", status: "paid" },
  { label: "Quote Approval", amount: "—", status: "completed" },
  { label: "70% Final", amount: "£6,930", status: "pending" },
]

interface Document {
  id: string
  name: string
  type: string
  category: string
  uploadedBy: string
  uploadedAt: string
  size: string
  status: "approved" | "pending" | "rejected"
  councilReference?: string
  url?: string
}

const documents: Document[] = [
  {
    id: "doc001",
    name: "Site_Plan_v2.pdf",
    type: "pdf",
    category: "Site Plans",
    uploadedBy: "David Brown",
    uploadedAt: "2026-01-15",
    size: "2.4 MB",
    status: "approved",
    councilReference: "TOWER/2026/00234-SP",
  },
  {
    id: "doc002",
    name: "Proposed_Elevations.pdf",
    type: "pdf",
    category: "Drawings",
    uploadedBy: "David Brown",
    uploadedAt: "2026-01-18",
    size: "1.8 MB",
    status: "approved",
    councilReference: "TOWER/2026/00234-PE",
  },
  {
    id: "doc003",
    name: "Existing_Plans.pdf",
    type: "pdf",
    category: "Drawings",
    uploadedBy: "James Mitchell",
    uploadedAt: "2026-01-10",
    size: "1.5 MB",
    status: "approved",
  },
  {
    id: "doc004",
    name: "Heritage_Statement.pdf",
    type: "pdf",
    category: "Reports",
    uploadedBy: "Rajesh Patel",
    uploadedAt: "2026-01-20",
    size: "890 KB",
    status: "pending",
  },
]

const INITIAL_CHAT: ChatMsg[] = [
  {
    id: 1,
    from: "client",
    text: "Can we reduce the extension depth slightly?",
    time: "10:24 AM",
  },
  {
    id: 2,
    from: "agent",
    text: "Yes, that improves approval chances. I'll revise the drawings and resend.",
    time: "10:41 AM",
  },
  {
    id: 3,
    from: "client",
    text: "Great, also any concerns about the left boundary?",
    time: "11:05 AM",
  },
  {
    id: 4,
    from: "agent",
    text: "We'll keep 1m clearance. That satisfies the council's party wall rules.",
    time: "11:18 AM",
  },
]

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface ChatMsg {
  id: number
  from: "client" | "agent"
  text: string
  time: string
  files?: AttachedFile[]
}

interface AttachedFile {
  name: string
  size: string
  type: "pdf" | "image" | "file"
  url?: string
}

type SectionId =
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

interface NavSection {
  id: SectionId
  label: string
  icon: React.ReactNode
}

const NAV_SECTIONS: NavSection[] = [
  { id: "project", label: "Project Overview", icon: <Building2 size={16} /> },
  { id: "submission", label: "Form Submission", icon: <FileCheck size={16} /> },
  { id: "dimensions", label: "Dimensions", icon: <Ruler size={16} /> },
  { id: "constraints", label: "Constraints", icon: <Shield size={16} /> },
  { id: "consultation", label: "Consultation", icon: <Video size={16} /> },
  { id: "requirements", label: "Requirements", icon: <FileText size={16} /> },
  { id: "quote", label: "Quote Summary", icon: <Banknote size={16} /> },
  { id: "documents", label: "Documents", icon: <File size={16} /> },
  { id: "communication", label: "Communication", icon: <MessageSquare size={16} /> },
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "payments", label: "Payments", icon: <Banknote size={16} /> },
  { id: "notes", label: "Notes", icon: <StickyNote size={16} /> },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function UserDetailsPage() {
  const { id } = useParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes] = useState([
    "Client confirmed boundary survey booked for 24 Feb.",
  ])
  const [showSendAnimation, setShowSendAnimation] = useState(false)
  const [showPayments, setShowPayments] = useState(true)
  const [activeSection, setActiveSection] = useState<SectionId>("submission")

  // chat
  const [messages, setMessages] = useState(INITIAL_CHAT)
  const [inputText, setInputText] = useState("")
  const [pendingFiles, setPendingFiles] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
const router=useRouter()
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAssign = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOpen(true)
    }, 100)
   router.push("/dashboard/projects/handover")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const mapped: AttachedFile[] = files.map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
      type: f.type.startsWith("image/") ? "image" : "pdf",
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }))
    setPendingFiles((p) => [...p, ...mapped])
    e.target.value = ""
  }

  const handleSend = () => {
    if (!inputText.trim() && pendingFiles.length === 0) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`
    setMessages((p) => [
      ...p,
      {
        id: Date.now(),
        from: "agent",
        text: inputText.trim(),
        time,
        files: pendingFiles.length ? [...pendingFiles] : undefined,
      },
    ])
    setInputText("")
    setPendingFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const addNote = () => {
    if (!noteText.trim()) return
    setNotes((p) => [...p, noteText.trim()])
    setNoteText("")
  }

  const progressValue = Math.round((flow.currentStep / (flow.steps.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                ← Back
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {customer.name}
                  </h1>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {customer.status}
                  </span>
                  {formSubmission.consultationBooked && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1">
                      <Video size={12} />
                      Consultation Scheduled
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Customer ID · {id ?? project.clientId} · {project.service} ·{" "}
                  {project.timeline}
                </p>
              </div>
            </div>

            {/* Progress pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2">
                <TrendingUp size={14} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-900">
                  {progressValue}%
                </span>
                <span className="text-xs text-blue-600">Journey Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── JOURNEY TRACKER ── */}
      <CustomerJourney
      steps={flow.steps}
      currentStep={flow.currentStep}
    />

      {/* ── MAIN CONTENT WITH SIDEBAR ── */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* ── LEFT: CONTENT AREA ── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
            
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

            {/* PROJECT OVERVIEW */}
            {activeSection === "project" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Building2 size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Project Overview
                  </h2>
                </div>

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

            {/* DOCUMENTS */}
            {activeSection === "documents" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <File size={18} className="text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Project Documents
                    </h2>
                  </div>
                  <span className="text-sm text-slate-500">
                    {documents.length} file{documents.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 rounded-xl border bg-slate-50 px-4 py-4 hover:shadow-md transition-shadow"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                        {doc.type === "image" ? (
                          <ImageIcon size={20} className="text-blue-500" />
                        ) : (
                          <FileText size={20} className="text-rose-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate mb-1">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span className="capitalize">{doc.category}</span>
                          <span>•</span>
                          <span>By {doc.uploadedBy}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.councilReference && (
                          <p className="text-[10px] text-blue-600 mt-1 font-mono">
                            Ref: {doc.councilReference}
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                          doc.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : doc.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {doc.status}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Section */}
                <div className="mt-6 pt-6 border-t">
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-4 py-8 transition-colors">
                    <Paperclip size={16} />
                    <span className="text-sm font-semibold">
                      Upload New Document
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* COMMUNICATION */}
            {activeSection === "communication" && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare size={18} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Client Communication
                  </h2>
                </div>

                <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto pr-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.from === "agent" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          m.from === "agent"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        {m.text && (
                          <p className="text-sm leading-relaxed">{m.text}</p>
                        )}
                        {m.files?.map((f, i) => (
                          <div
                            key={i}
                            className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                              m.from === "agent"
                                ? "bg-blue-700"
                                : "bg-white border"
                            }`}
                          >
                            <Paperclip size={12} />
                            <span className="flex-1 truncate">{f.name}</span>
                            <span className="text-[10px] opacity-70">
                              {f.size}
                            </span>
                          </div>
                        ))}
                        <p
                          className={`text-[10px] mt-2 ${
                            m.from === "agent"
                              ? "text-blue-200"
                              : "text-slate-400"
                          }`}
                        >
                          {m.from === "agent" ? "You" : "Client"} · {m.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {pendingFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {pendingFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs"
                      >
                        <Paperclip size={12} className="text-blue-600" />
                        <span className="text-slate-700">{f.name}</span>
                        <button
                          onClick={() =>
                            setPendingFiles((p) => p.filter((_, j) => j !== i))
                          }
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white border rounded-xl p-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message to the client…"
                      rows={1}
                      className="flex-1 resize-none text-sm outline-none bg-transparent leading-5 py-0.5 min-h-[30px] max-h-[100px]"
                      onInput={(e: any) => {
                        e.target.style.height = "auto"
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 100) + "px"
                      }}
                    />
                    <div className="flex items-center gap-1 pb-0.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Paperclip size={16} />
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={
                          !inputText.trim() && pendingFiles.length === 0
                        }
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                    Enter to send · Shift+Enter for new line
                  </p>
                </div>
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

            {/* PAYMENTS */}
            {activeSection === "payments" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Banknote size={18} className="text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Payment Timeline
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowPayments((p) => !p)}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100"
                    title={showPayments ? "Hide" : "Show"}
                  >
                    {showPayments ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {showPayments ? (
                  <>
                    <div className="space-y-3 mb-4">
                      {payments.map((p, i) => (
                        <div
                          key={p.label}
                          className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                              p.status === "paid"
                                ? "bg-emerald-500"
                                : p.status === "completed"
                                ? "bg-blue-500"
                                : "bg-amber-400"
                            }`}
                          >
                            {p.status === "paid" || p.status === "completed"
                              ? "✓"
                              : i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">
                              {p.label}
                            </p>
                            <p className="text-xs text-slate-400">{p.amount}</p>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              p.status === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "completed"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-3 border-t">
                      <Lock size={12} />
                      Visible to Agent X only
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border">
                    Payment details hidden
                  </p>
                )}
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

          {/* ── RIGHT: SIDEBAR NAVIGATION ── */}
          <div className="lg:sticky lg:top-5 h-fit">
            <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col">
              {/* HEADER */}
              <div className="mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sections
                </p>
              </div>

              {/* NAV */}
              <nav className="space-y-1 flex-1">
                {NAV_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                      ${
                        activeSection === section.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    <span
                      className={
                        activeSection === section.id
                          ? "text-white"
                          : "text-slate-400"
                      }
                    >
                      {section.icon}
                    </span>
                    <span className="text-sm font-medium">
                      {section.label}
                    </span>
                    {activeSection === section.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                ))}
{/* 
                <SendToAgentAnimation
        open={open}
        onClose={() => {
          setOpen(false)
          router.push("/dashboard/projects/handover")
        }}
      /> */}
              </nav>

              {/* QUICK STATS */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Documents</span>
                  <span className="font-semibold text-slate-700">
                    {documents.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Messages</span>
                  <span className="font-semibold text-slate-700">
                    {messages.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Notes</span>
                  <span className="font-semibold text-slate-700">
                    {notes.length}
                  </span>
                </div>
                  {/* Trigger Button */}
       <div className="p-8">
      <button
        onClick={handleAssign}
        className="w-full rounded-xl bg-blue-700 px-6 py-4 text-white font-medium hover:bg-blue-800 flex items-center justify-center gap-2 transition-all"
      >
        <Briefcase size={18} />
        Submit
      </button>
    </div>
                {formSubmission.consultationBooked && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <span className="text-slate-500">Next Meeting</span>
                    <span className="font-semibold text-blue-700">
                      {formSubmission.consultationTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ASSIGN DIALOG ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="text-emerald-600" size={18} />
              Project Assigned
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 border px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Project ID
              </p>
              <p className="font-mono font-bold text-slate-900">
                {project.id}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Assigned To
              </p>
              <p className="text-sm font-semibold text-blue-900">
                {assignedAgentY}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Confirm & Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LOADING ── */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center">
          <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-700">
              Assigning project…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}