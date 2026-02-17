"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))

  const otpRefs = useRef<HTMLInputElement[]>([])

  /* ================= LOGIN SUBMIT ================= */

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!showOtp) {
      console.log("Credentials submitted → show OTP")
      setShowOtp(true)

      setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)

      return
    }

    const otpValue = otp.join("")
    if (otpValue.length !== 6) return

    console.log("OTP Verified:", otpValue)
    router.push("/dashboard")
  }

  /* ================= OTP HANDLERS ================= */

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const updatedOtp = [...otp]
    updatedOtp[index] = value
    setOtp(updatedOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sign In
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to Ai4Planning.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* EMAIL */}
        <input
          type="email"
          required
          disabled={showOtp}
          placeholder="architect@nexus.ai"
          className="w-full h-14 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border disabled:opacity-60"
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            disabled={showOtp}
            placeholder="••••••••••"
            className="w-full h-14 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>

        {/* 🔐 OTP BOXES */}
        {showOtp && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              OTP Verification
            </p>

            <div className="flex justify-between gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) otpRefs.current[index] = el
                  }}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) =>
                    handleOtpKeyDown(index, e)
                  }
                  maxLength={1}
                  inputMode="numeric"
                  className="
                    w-12 h-14
                    text-center text-xl font-bold
                    rounded-lg border
                    bg-slate-50 dark:bg-slate-800/50
                    focus:ring-2 focus:ring-primary
                  "
                />
              ))}
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          className="
            w-full bg-primary hover:bg-primary/90
            text-white font-bold py-4 rounded-lg
            transition-all
          "
        >
          {showOtp ? "VERIFY & CONTINUE" : "SIGN IN"}
        </button>
      </form>

      
    </div>
  )
}
