"use client"

import type React from "react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function ClientLogin() {
  const router = useRouter()

  const [step, setStep] = useState<"REQUEST_OTP" | "VERIFY_OTP">("REQUEST_OTP")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [resending, setResending] = useState(false)

  const identifier = email || phone

  /* ================= SUBMIT HANDLER ================= */

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email && !phone) {
      toast.error("Please enter email or phone number")
      return
    }

    /* ===== STEP 1: REQUEST OTP ===== */
    if (step === "REQUEST_OTP") {
      console.log("Sending OTP to:", identifier)

      toast.success(`OTP sent to ${identifier}`)

      // UX delay
      setTimeout(() => {
        setStep("VERIFY_OTP")
      }, 300)

      return
    }

    /* ===== STEP 2: VERIFY OTP ===== */
    if (step === "VERIFY_OTP") {
      const otpCode = otp.join("")

      if (otpCode.length !== 6) {
        toast.error("Please enter the 6-digit OTP")
        return
      }

      console.log("Verifying OTP:", otpCode)

      // ✅ SUCCESS
      toast.success("OTP verified successfully")

      // 🔐 Redirect after verification
      router.push("/profile")
    }
  }

  /* ================= RESEND OTP ================= */

  const handleResendOtp = () => {
    if (!identifier) return

    setResending(true)
    console.log("Resending OTP to:", identifier)
    toast.success(`OTP resent to ${identifier}`)

    setTimeout(() => setResending(false), 3000)
  }

  return (
    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Sign In
        </h2>
        <p className="text-sm text-slate-500">
          {step === "REQUEST_OTP"
            ? "Enter your email or phone number to receive OTP."
            : `OTP sent to ${identifier}`}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* FULL NAME */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            disabled={step === "VERIFY_OTP"}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full h-14 px-4 rounded-lg border text-black"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            disabled={step === "VERIFY_OTP"}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7911 123456"
            className="w-full h-14 px-4 rounded-lg border text-black"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled={step === "VERIFY_OTP"}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-14 px-4 rounded-lg border text-black"
          />
        </div>

        {/* OTP INPUT */}
        {step === "VERIFY_OTP" && (
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                6-Digit OTP
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-[10px] text-blue-600 hover:underline disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <div className="flex justify-center">
              {otp.map((digit, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/, "")
                      if (!value) return

                      const newOtp = [...otp]
                      newOtp[index] = value
                      setOtp(newOtp)

                      if (index < 5) {
                        document
                          .getElementById(`otp-${index + 1}`)
                          ?.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newOtp = [...otp]
                        newOtp[index] = ""
                        setOtp(newOtp)

                        if (index > 0) {
                          document
                            .getElementById(`otp-${index - 1}`)
                            ?.focus()
                        }
                      }
                    }}
                    className="w-12 h-12 text-center text-lg font-semibold rounded-lg border text-black"
                  />

                  {index < otp.length - 1 && (
                    <span className="mx-2 text-slate-400 font-bold">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-3 rounded hover:bg-blue-600 transition"
        >
          {step === "REQUEST_OTP"
            ? "Send OTP via Email"
            : "Sign In"}
        </button>
      </form>
    </div>
  )
}
