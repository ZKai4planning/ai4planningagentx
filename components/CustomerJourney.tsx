"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle,
  Circle,
  CircleDot,
  Clock,
  ChevronRight,
} from "lucide-react"

export type JourneyStep = {
  label: string
  calloutLabel?: string
  desc: string
  details?: string[]
  detailsLabel?: string
  detailGroups?: {
    label: string
    variant?: "chips" | "cards"
    items: (
      | string
      | {
          id: string
          label: string
          selectedAction?: string
          actions?: {
            label: string
            value: string
          }[]
        }
    )[]
  }[]
  calloutTypewriterText?: string
  calloutStyle?: "default" | "eligibility"
  hideNextLabel?: boolean
}

type CustomerJourneyProps = {
  steps: JourneyStep[]
  currentStep: number
  showAdvance?: boolean
  advanceLabel?: string
  onAdvance?: () => void
  onStepSelect?: (index: number) => void
  onDetailAction?: (
    stepIndex: number,
    groupLabel: string,
    itemId: string,
    actionValue: string
  ) => void
  notificationSlot?: React.ReactNode
  calloutActions?: React.ReactNode
}

export default function CustomerJourney({
  steps,
  currentStep,
  showAdvance = false,
  advanceLabel = "Advance",
  onAdvance,
  onStepSelect,
  onDetailAction,
  notificationSlot,
  calloutActions,
}: CustomerJourneyProps) {
  const activeStep = steps[currentStep]
  const isEligibilityCallout = activeStep?.calloutStyle === "eligibility"

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-8 mt-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {notificationSlot ? (
              <div className="flex items-center">{notificationSlot}</div>
            ) : null}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Customer Journey
              </h2>
              <p className="text-sm text-slate-500">
                End-to-end service lifecycle
              </p>
            </div>
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
                  className={`flex flex-col items-center gap-2 relative ${
                    onStepSelect ? "cursor-pointer" : ""
                  }`}
                  role={onStepSelect ? "button" : undefined}
                  tabIndex={onStepSelect ? 0 : undefined}
                  onClick={onStepSelect ? () => onStepSelect(i) : undefined}
                  onKeyDown={
                    onStepSelect
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onStepSelect(i)
                          }
                        }
                      : undefined
                  }
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
        <div className={isEligibilityCallout ? "mt-8" : "mt-8 pt-6 border-t"}>
          <div
            className={
              isEligibilityCallout
                ? "rounded-[28px] bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 px-5 py-5 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.85)] sm:px-6 sm:py-6"
                : ""
            }
          >
            <div className="flex items-start gap-4">
              {isEligibilityCallout ? (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cyan-400/10 ring-1 ring-white/10">
                  <video
                    className="h-8 w-8 rounded-xl object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/video-logo-animation.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Clock className="text-blue-600" size={18} />
                </div>
              )}

              <div className="flex-1">
                <p
                  className={
                    isEligibilityCallout
                      ? "text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200"
                      : "mb-1 text-sm font-bold text-slate-900"
                  }
                >
                  {activeStep?.calloutLabel ?? activeStep?.label}
                </p>
                <p
                  className={
                    isEligibilityCallout
                      ? "mt-3 text-sm leading-7 text-slate-100 sm:text-[15px]"
                      : "text-sm text-slate-600"
                  }
                >
                  {activeStep?.calloutTypewriterText ? (
                    <TypewriterText
                      key={activeStep.calloutTypewriterText}
                      text={activeStep.calloutTypewriterText}
                    />
                  ) : null}
                  {!activeStep?.calloutTypewriterText ? activeStep?.desc : null}
                </p>

                {calloutActions ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {calloutActions}
                  </div>
                ) : null}

                {showAdvance && onAdvance ? (
                  <button
                    type="button"
                    onClick={onAdvance}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    {advanceLabel}
                  </button>
                ) : null}

                {activeStep?.detailGroups?.length ? (
                  <div className="mt-3 space-y-3">
                    {activeStep.detailGroups.map((group) =>
                      group.items.length > 0 ? (
                        <div
                          key={group.label}
                          className={
                            isEligibilityCallout
                              ? "rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                              : "rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4"
                          }
                        >
                          <p
                            className={
                              isEligibilityCallout
                                ? "mb-2 text-xs font-semibold text-slate-300"
                                : "mb-2 text-xs font-semibold text-slate-500"
                            }
                          >
                            {group.label}
                          </p>
                          {group.variant === "cards" ? (
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {group.items.map((item) =>
                                typeof item === "string" ? (
                                  <div
                                    key={`${group.label}-${item}`}
                                    className={
                                      isEligibilityCallout
                                        ? "rounded-2xl border border-cyan-400/20 bg-white/10 px-3 py-3 text-sm font-medium text-cyan-100"
                                        : "rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
                                    }
                                  >
                                    {item}
                                  </div>
                                ) : (
                                  <div
                                    key={`${group.label}-${item.id}`}
                                    className={
                                      isEligibilityCallout
                                        ? "rounded-2xl border border-cyan-400/20 bg-white/10 px-3 py-3"
                                        : "rounded-2xl border border-slate-200 bg-white px-3 py-3"
                                    }
                                  >
                                    <p
                                      className={
                                        isEligibilityCallout
                                          ? "text-sm font-semibold text-white"
                                          : "text-sm font-semibold text-slate-900"
                                      }
                                    >
                                      {item.label}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {item.actions?.map((action) => {
                                        const selected = item.selectedAction === action.value

                                        return (
                                          <button
                                            key={`${item.id}-${action.value}`}
                                            type="button"
                                            onClick={() =>
                                              onDetailAction?.(
                                                currentStep,
                                                group.label,
                                                item.id,
                                                action.value
                                              )
                                            }
                                            className={
                                              selected
                                                ? isEligibilityCallout
                                                  ? "rounded-full border border-cyan-300 bg-cyan-300/20 px-3 py-1 text-[11px] font-semibold text-cyan-100"
                                                  : "rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700"
                                                : isEligibilityCallout
                                                ? "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-white/10"
                                                : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
                                            }
                                          >
                                            {action.label}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {group.items.map((item) => (
                                <span
                                  key={`${group.label}-${typeof item === "string" ? item : item.id}`}
                                  className={
                                    isEligibilityCallout
                                      ? "rounded-full border border-cyan-400/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100"
                                      : "rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700"
                                  }
                                >
                                  {typeof item === "string" ? item : item.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                ) : null}

                {!activeStep?.detailGroups?.length && activeStep?.details?.length ? (
                  <div className="mt-3">
                    <p
                      className={
                        isEligibilityCallout
                          ? "mb-2 text-xs font-semibold text-slate-300"
                          : "mb-2 text-xs font-semibold text-slate-500"
                      }
                    >
                      {activeStep?.detailsLabel ?? "Required documents"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeStep.details.map((item) => (
                        <span
                          key={item}
                          className={
                            isEligibilityCallout
                              ? "rounded-full border border-cyan-400/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100"
                              : "rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700"
                          }
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!activeStep?.hideNextLabel && steps[currentStep + 1] ? (
                  <p
                    className={
                      isEligibilityCallout
                        ? "mt-3 flex items-center gap-1 text-xs text-slate-300"
                        : "mt-2 flex items-center gap-1 text-xs text-slate-400"
                    }
                  >
                    <ChevronRight size={12} />
                    Next: {steps[currentStep + 1].label}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TypewriterText({ text }: { text: string }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    let cursor = 0
    const interval = window.setInterval(() => {
      cursor += 1
      setVisibleCount(cursor)

      if (cursor >= text.length) {
        window.clearInterval(interval)
      }
    }, 16)

    return () => {
      window.clearInterval(interval)
    }
  }, [text])

  return (
    <>
      {text.slice(0, visibleCount)}
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-4 w-px animate-pulse bg-cyan-200 align-[-2px]"
      />
    </>
  )
}
