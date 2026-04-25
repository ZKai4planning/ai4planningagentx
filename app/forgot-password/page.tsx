"use client";

import { AxiosError } from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosinstance";

type PasswordResetRequestResponse = {
  success: boolean;
  message: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axiosInstance.post<PasswordResetRequestResponse>(
        "/admin/password-requests",
        {
          email: email.trim().toLowerCase(),
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to send request.");
      }

      setSuccessMessage(response.data.message);
      setEmail("");

      setTimeout(() => {
        router.push("/login");
      }, 5000);

    } catch (err: unknown) {
      const errorMessage =
        (err instanceof AxiosError
          ? (err.response?.data as PasswordResetRequestResponse | undefined)
              ?.message
          : "") ||
        (err instanceof Error ? err.message : "") ||
        "Failed to send request. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">

        {/* TITLE */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Forgot Password
          </h2>
        </div>

        {/* DISCLAIMER */}
        <div className="text-sm text-slate-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-semibold text-yellow-800 mb-1">
            Note:
          </p>
          <p>
            The admin will reset your password and send it to your email.
            After logging in with the provided password, please make sure
            to change your password immediately.
          </p>
        </div>

        {/* FORM */}
        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* EMAIL INPUT */}
            <div>
              <label
                htmlFor="email"
                className="text-xs font-bold text-slate-400 uppercase mb-2 block"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        ) : (
          /* SUCCESS MESSAGE */
          <div className="text-sm text-green-700 bg-green-50 p-4 rounded-lg">
            <p>{successMessage}</p>
            <p className="mt-2 text-green-600">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
