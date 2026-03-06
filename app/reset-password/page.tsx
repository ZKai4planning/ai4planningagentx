"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosinstance";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { z } from "zod";

/* =========================
   ZOD VALIDATION (INLINE)
========================= */
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must not exceed 16 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* =========================
   COMPONENT
========================= */
export default function ResetPasswordPage() {
  const router = useRouter();
  const email = useSearchParams().get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // ✅ ZOD VALIDATION
    const parsed = resetPasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setErrorMessage(
        errors.newPassword?.[0] ||
          errors.confirmPassword?.[0] ||
          "Invalid password"
      );
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/employee/auth/reset-password", {
        email,
        newPassword,
      });

      setSuccessMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create a new secure password
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          
          {/* New Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full h-14 px-4 rounded-lg
                  bg-slate-50 dark:bg-slate-800/50
                  border border-slate-200 dark:border-slate-700
                  text-slate-900 dark:text-white
                  focus:ring-2 focus:ring-primary focus:border-primary
                  transition-all"
              />

              {showPassword ? (
                <EyeOffIcon
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <EyeIcon
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {/* Password rules */}
            <ul className="text-xs text-slate-500 space-y-1 mt-2">
              <li>• 8–16 characters</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
              <li>• One special character</li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter new password"
              className="w-full h-14 px-4 rounded-lg
                bg-slate-50 dark:bg-slate-800/50
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-white
                focus:ring-2 focus:ring-primary focus:border-primary
                transition-all"
            />
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-3 text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-3 text-sm text-green-700 dark:text-green-300">
              {successMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-lg
              transition-all duration-300 active:scale-95 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
