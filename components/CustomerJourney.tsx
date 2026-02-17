"use client"

import {
  CheckCircle,
  Circle,
  CircleDot,
  Clock,
  ChevronRight,
} from "lucide-react"

type JourneyStep = {
  label: string
  desc: string
}

type CustomerJourneyProps = {
  steps: JourneyStep[]
  currentStep: number
}

export default function CustomerJourney({
  steps,
  currentStep,
}: CustomerJourneyProps) {
  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-8 mt-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Customer Journey
            </h2>
            <p className="text-sm text-slate-500">
              End-to-end service lifecycle
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Scrollable Stepper */}
        <div className="relative overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max px-2 py-4">
            {/* Background rail */}
            <div className="absolute top-[32px] left-6 right-6 h-0.5 bg-slate-200" />

            {/* Progress fill */}
            <div
              className="absolute top-[32px] left-6 h-0.5 bg-blue-600 transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((step, i) => {
              const status =
                i < currentStep
                  ? "completed"
                  : i === currentStep
                  ? "active"
                  : "upcoming"

              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 relative"
                >
                  {/* Node */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all duration-300 ${
                      status === "completed"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                        : status === "active"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle size={16} />
                    ) : status === "active" ? (
                      <CircleDot size={16} />
                    ) : (
                      <Circle size={16} />
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center min-w-[140px] max-w-[160px]">
                    <p
                      className={`text-xs font-semibold mb-0.5 ${
                        status === "active"
                          ? "text-slate-900"
                          : status === "completed"
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {step.desc}
                    </p>
                  </div>

                  {status === "active" && (
                    <span className="absolute -bottom-6 text-[9px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                      Now
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Step Callout */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="text-blue-600" size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 mb-1">
                {steps[currentStep]?.label}
              </p>
              <p className="text-sm text-slate-600">
                {steps[currentStep]?.desc}
              </p>

              {steps[currentStep + 1] && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <ChevronRight size={12} />
                  Next: {steps[currentStep + 1].label}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
