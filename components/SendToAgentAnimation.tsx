"use client"
import { useState } from "react"
import {
  Send, CheckCircle, Shield, FileText, Building2,
  Ruler, Calendar, Eye, EyeOff, Lock, User, CreditCard,
  Phone, Mail, MapPin, TrendingUp, X, CheckCheck,
  Briefcase
} from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { useRouter } from "next/router"

interface DataItem {
  id: string
  label: string
  icon: React.ReactNode
  category: "project" | "personal" | "payment"
  included: boolean
}
interface SendToAgentAnimationProps {
  open: boolean
  onClose: () => void
}

const DATA_ITEMS: DataItem[] = [
  // Project Data (Included)
  { id: "service", label: "Service Type", icon: <Building2 size={14} />, category: "project", included: true },
  { id: "scope", label: "Scope of Work", icon: <Ruler size={14} />, category: "project", included: true },
  { id: "timeline", label: "Project Timeline", icon: <Calendar size={14} />, category: "project", included: true },
  { id: "requirements", label: "Requirements", icon: <FileText size={14} />, category: "project", included: true },
  { id: "constraints", label: "Constraints", icon: <Shield size={14} />, category: "project", included: true },
  { id: "documents", label: "Project Documents", icon: <FileText size={14} />, category: "project", included: true },
  
  // Personal Data (Excluded)
  { id: "name", label: "Customer Name", icon: <User size={14} />, category: "personal", included: false },
  { id: "phone", label: "Phone Number", icon: <Phone size={14} />, category: "personal", included: false },
  { id: "email", label: "Email Address", icon: <Mail size={14} />, category: "personal", included: false },
  { id: "location", label: "Personal Location", icon: <MapPin size={14} />, category: "personal", included: false },
  
  // Payment Data (Excluded)
  { id: "payment-history", label: "Payment History", icon: <CreditCard size={14} />, category: "payment", included: false },
  { id: "quote-details", label: "Quote Breakdown", icon: <TrendingUp size={14} />, category: "payment", included: false },
  { id: "financial", label: "Financial Info", icon: <Lock size={14} />, category: "payment", included: false },
]

export default function SendToAgentAnimation() {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<"filtering" | "sending" | "complete">("filtering")
  const [processedItems, setProcessedItems] = useState<string[]>([])

  const handleSend = () => {
    setOpen(true)
    setStage("filtering")
    setProcessedItems([])

    // Animate filtering process
    DATA_ITEMS.forEach((item, index) => {
      setTimeout(() => {
        setProcessedItems(prev => [...prev, item.id])
      }, index * 150)
    })
   
    const router = useRouter()
const [showSendAnimation, setShowSendAnimation] = useState(false)

    // Move to sending stage
    setTimeout(() => {
      setStage("sending")
    }, DATA_ITEMS.length * 150 + 500)

    // Complete
    setTimeout(() => {
      setStage("complete")
    }, DATA_ITEMS.length * 150 + 2500)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setStage("filtering")
      setProcessedItems([])
    }, 300)
  }

  const includedItems = DATA_ITEMS.filter(item => item.included)
  const excludedItems = DATA_ITEMS.filter(item => !item.included)

  return (
    <>
    

      {/* Animation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[85vh] overflow-hidden p-0">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Secure Data Transfer</h3>
                  <p className="text-xs text-blue-100">Privacy-First Protocol Active</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Stage Indicator */}
          <div className="px-6 py-4 bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              {[
                { id: "filtering", label: "Filtering Data", icon: <Shield size={14} /> },
                { id: "sending", label: "Secure Transfer", icon: <Send size={14} /> },
                { id: "complete", label: "Complete", icon: <CheckCircle size={14} /> },
              ].map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    stage === s.id ? "bg-blue-600 text-white scale-110" :
                    ["filtering", "sending", "complete"].indexOf(stage) > idx ? "bg-emerald-500 text-white" :
                    "bg-slate-200 text-slate-400"
                  }`}>
                    {["filtering", "sending", "complete"].indexOf(stage) > idx ? "✓" : idx + 1}
                  </div>
                  <span className={`text-xs font-medium ${
                    stage === s.id ? "text-blue-700" : "text-slate-400"
                  }`}>
                    {s.label}
                  </span>
                  {idx < 2 && <div className="w-8 h-0.5 bg-slate-200 mx-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[calc(85vh-200px)] overflow-y-auto">
            
            {stage === "filtering" && (
              <div className="space-y-6">
                {/* Info Box */}
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Privacy Protection Active
                      </p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        We're automatically filtering out personal information and payment details. 
                        Only project-related data will be shared with Agent Y.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Included Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="text-emerald-600" size={16} />
                    <h4 className="text-sm font-bold text-slate-700">Data Being Shared</h4>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      {includedItems.length} items
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {includedItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300 ${
                          processedItems.includes(item.id)
                            ? "bg-emerald-50 border-emerald-200 scale-100 opacity-100"
                            : "bg-white border-slate-200 scale-95 opacity-40"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          processedItems.includes(item.id) ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          {item.icon}
                        </div>
                        <span className={`text-xs font-medium flex-1 ${
                          processedItems.includes(item.id) ? "text-emerald-900" : "text-slate-400"
                        }`}>
                          {item.label}
                        </span>
                        {processedItems.includes(item.id) && (
                          <CheckCircle className="text-emerald-600 animate-in zoom-in" size={14} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Excluded Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <EyeOff className="text-slate-400" size={16} />
                    <h4 className="text-sm font-bold text-slate-700">Protected Data (Not Shared)</h4>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      {excludedItems.length} items
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {excludedItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300 ${
                          processedItems.includes(item.id)
                            ? "bg-slate-50 border-slate-200 opacity-100"
                            : "bg-white border-slate-100 opacity-40"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          processedItems.includes(item.id) ? "bg-slate-200 text-slate-500" : "bg-slate-100 text-slate-300"
                        }`}>
                          {item.icon}
                        </div>
                        <span className={`text-xs font-medium flex-1 ${
                          processedItems.includes(item.id) ? "text-slate-600 line-through" : "text-slate-300"
                        }`}>
                          {item.label}
                        </span>
                        {processedItems.includes(item.id) && (
                          <Lock className="text-slate-400 animate-in zoom-in" size={14} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stage === "sending" && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-6">
                  {/* Animated Circle */}
                  <div className="w-24 h-24 rounded-full bg-blue-100 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Send className="text-blue-600 animate-bounce" size={32} />
                  </div>
                  {/* Particles */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-blue-400"
                        style={{
                          top: "50%",
                          left: "50%",
                          animation: `particle-${i} 1.5s infinite`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Securely Transferring Data
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
                  Encrypting and sending {includedItems.length} project-related items to Agent Y
                </p>

                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-2000"
                      style={{ width: "100%", transition: "width 2s ease-in-out" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>Encrypting...</span>
                    <span>Sending...</span>
                  </div>
                </div>
              </div>
            )}

            {stage === "complete" && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-in zoom-in">
                  <CheckCheck className="text-emerald-600" size={36} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Successfully Sent!
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-md mb-6">
                  Agent Y has received the project details securely. Personal and payment information remained protected.
                </p>

                {/* Summary */}
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-emerald-600" size={16} />
                      <span className="text-sm font-medium text-emerald-900">Shared</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">{includedItems.length} items</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Lock className="text-slate-500" size={16} />
                      <span className="text-sm font-medium text-slate-700">Protected</span>
                    </div>
                    <span className="text-sm font-bold text-slate-600">{excludedItems.length} items</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <style jsx>{`
            @keyframes particle-0 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(40px) translateY(0); opacity: 1; }
            }
            @keyframes particle-1 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(28px) translateY(28px); opacity: 1; }
            }
            @keyframes particle-2 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(0) translateY(40px); opacity: 1; }
            }
            @keyframes particle-3 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(-28px) translateY(28px); opacity: 1; }
            }
            @keyframes particle-4 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(-40px) translateY(0); opacity: 1; }
            }
            @keyframes particle-5 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(-28px) translateY(-28px); opacity: 1; }
            }
            @keyframes particle-6 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(0) translateY(-40px); opacity: 1; }
            }
            @keyframes particle-7 {
              0%, 100% { transform: translate(-50%, -50%) translateX(0) translateY(0); opacity: 0; }
              50% { transform: translate(-50%, -50%) translateX(28px) translateY(-28px); opacity: 1; }
            }
          `}</style>
        </DialogContent>
      </Dialog>
    </>
  )
}