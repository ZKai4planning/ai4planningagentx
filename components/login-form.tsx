// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import type React from "react";
// import { FcGoogle } from "react-icons/fc";
// import { EyeIcon, EyeOffIcon } from "lucide-react";
// import { useAuthStore } from "@/lib/zustand";
// import { findAccountByEmail } from "@/lib/static-auth";

// export function ClientLogin() {
//   const router = useRouter();

//   const [step, setStep] = useState<"SUBMIT" | "VERIFY_OTP">("SUBMIT");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
//   const [resending, setResending] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
//   const [lockedHours, setLockedHours] = useState<number | null>(null);
//   const [isLocked, setIsLocked] = useState(false);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const { setUser } = useAuthStore.getState();

//   const resetErrorState = () => {
//     setErrorMessage(null);
//     setRemainingAttempts(null);
//     setLockedHours(null);
//     setIsLocked(false);
//     setSuccessMessage(null);
//   };

//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEmail(e.target.value);
//     resetErrorState();
//   };

//   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPassword(e.target.value);
//     resetErrorState();
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (step === "SUBMIT") {
//       resetErrorState();

//       const account = findAccountByEmail(email.trim());
//       if (!account) {
//         setErrorMessage("Account not found");
//         return;
//       }

//       if (password !== account.password) {
//         setErrorMessage("Invalid credentials");
//         return;
//       }

//       setSuccessMessage("OTP sent successfully");
//       setStep("VERIFY_OTP");
//       return;
//     }

//     if (step === "VERIFY_OTP") {
//       const otpCode = otp.join("");

//       if (!/^\d{6}$/.test(otpCode)) {
//         setErrorMessage("Please enter any 6-digit OTP to verify.");
//         return;
//       }

//       const account = findAccountByEmail(email.trim());
//       if (!account) {
//         setErrorMessage("Account not found");
//         return;
//       }

//       setUser({
//         userName: account.name,
//         role: account.role,
//         region: account.region,
//       });
//       router.push("/Dashboard");
//     }
//   };

//   const handleResendOtp = async () => {
//     setResending(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);

//     setTimeout(() => {
//       setSuccessMessage("OTP sent successfully");
//       setResending(false);
//     }, 800);
//   };

//   return (
//     <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
//       <div className="mb-8">
//         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
//           Sign In
//         </h2>
//       </div>

//       {step === "SUBMIT" && (
//         <button
//           type="button"
//           className="w-full flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 rounded-lg py-3 mb-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
//         >
//           <FcGoogle size={20} />
//           <span className="text-sm font-medium text-slate-700 dark:text-white">
//             Continue with Google
//           </span>
//         </button>
//       )}

//       <form className="space-y-6" onSubmit={handleSubmit}>
//         <div className="group">
//           <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
//             Email
//           </label>
//           <input
//             type="email"
//             required
//             value={email}
//             onChange={handleEmailChange}
//             disabled={step === "VERIFY_OTP"}
//             placeholder="admin@example.com"
//             className={`w-full h-14 px-4 rounded-lg
//               bg-slate-50 dark:bg-slate-800/50
//               border border-slate-200 dark:border-slate-700
//               text-slate-900 dark:text-white
//               focus:ring-2 focus:ring-primary focus:border-primary
//               transition-all
//               ${step === "VERIFY_OTP" ? "opacity-70 cursor-not-allowed" : ""}`}
//           />
//         </div>

//         {step === "SUBMIT" && (
//           <div className="group">
//             <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 required
//                 value={password}
//                 onChange={handlePasswordChange}
//                 placeholder="Enter your password"
//                 className="w-full h-14 px-4 rounded-lg
//                 bg-slate-50 dark:bg-slate-800/50
//                 border border-slate-200 dark:border-slate-700
//                 text-slate-900 dark:text-white
//                 focus:ring-2 focus:ring-primary focus:border-primary
//                 transition-all"
//               />
//               {showPassword ? (
//                 <EyeOffIcon
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
//                   onClick={() => setShowPassword(false)}
//                 />
//               ) : (
//                 <EyeIcon
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
//                   onClick={() => setShowPassword(true)}
//                 />
//               )}
//             </div>
//           </div>
//         )}

//         {step === "VERIFY_OTP" && (
//           <div className="group">
//             <div className="flex justify-between items-end mb-3">
//               <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
//                 6-Digit OTP
//               </label>
//               <button
//                 type="button"
//                 onClick={handleResendOtp}
//                 disabled={resending}
//                 className="text-[10px] text-primary hover:underline disabled:opacity-50"
//               >
//                 {resending ? "Resending..." : "Resend OTP"}
//               </button>
//             </div>

//             <div className="flex items-center justify-center gap-1">
//               {otp.map((digit, index) => (
//                 <div key={index} className="flex items-center">
//                   <input
//                     id={`otp-${index}`}
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={1}
//                     value={digit}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/, "");
//                       if (!value) return;
//                       const newOtp = [...otp];
//                       newOtp[index] = value;
//                       setOtp(newOtp);
//                       if (index < 5)
//                         document.getElementById(`otp-${index + 1}`)?.focus();
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === "Backspace") {
//                         const newOtp = [...otp];
//                         newOtp[index] = "";
//                         setOtp(newOtp);
//                         if (index > 0)
//                           document.getElementById(`otp-${index - 1}`)?.focus();
//                       }
//                     }}
//                     onPaste={(e) => {
//                       const pasted = e.clipboardData
//                         .getData("text")
//                         .replace(/\D/g, "")
//                         .slice(0, 6);
//                       if (pasted.length === 6) setOtp(pasted.split(""));
//                     }}
//                     className="w-10 h-10 text-center text-lg font-semibold
//                       bg-slate-50 dark:bg-slate-800/50
//                       border border-slate-200 dark:border-slate-700
//                       rounded-lg text-slate-900 dark:text-white
//                       focus:ring-2 focus:ring-primary focus:border-primary
//                       transition-all"
//                   />
//                   {index < otp.length - 1 && (
//                     <span className="mx-1 text-slate-400 font-bold select-none">
//                       -
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {errorMessage && (
//           <div
//             className={`rounded-lg p-3 text-sm ${
//               isLocked
//                 ? "bg-red-100 text-red-700"
//                 : "bg-yellow-100 text-yellow-700"
//             }`}
//           >
//             <p>{errorMessage}</p>

//             {remainingAttempts !== null && (
//               <p className="text-xs mt-1">
//                 Remaining attempts: <strong>{remainingAttempts}</strong>
//               </p>
//             )}

//             {lockedHours !== null && (
//               <p className="text-xs mt-1">
//                 Try again after <strong>{lockedHours}</strong> hours
//               </p>
//             )}
//           </div>
//         )}

//         {successMessage && (
//           <div className="rounded-lg p-3 text-sm bg-green-100 text-green-700">
//             {successMessage}
//           </div>
//         )}

//         <button
//           type="submit"
//           className="w-full bg-primary text-white font-bold py-3 rounded
//             transition-all duration-300 active:scale-95"
//         >
//           {step === "SUBMIT" ? "Submit" : "Verify & Sign In"}
//         </button>
//       </form>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type React from "react";
import { FcGoogle } from "react-icons/fc";
import axiosInstance from "@/lib/axiosinstance";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuthStore } from "@/lib/zustand"



// after OTP verification success


export default function ClientLogin() {
  const router = useRouter();
  const loginRegion = "uk";

  const [step, setStep] = useState<"SUBMIT" | "VERIFY_OTP">("SUBMIT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 error & lock states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockedHours, setLockedHours] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* =========================
     INPUT HANDLERS
  ========================= */

  const setToken = useAuthStore((state) => state.setToken);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    resetErrorState();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    resetErrorState();
  };
  const resetErrorState = () => {
    setErrorMessage(null);
    setRemainingAttempts(null);
    setLockedHours(null);
    setIsLocked(false);
    setSuccessMessage(null); // 👈 add this
  };


  /* =========================
     SUBMIT HANDLER
  ========================= */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* =========================
       LOGIN STEP
    ========================= */
    if (step === "SUBMIT") {
      resetErrorState();

      try {
        await axiosInstance.post("/employee/auth/login", {
          email,
          password,
          region: loginRegion,
        });

        setStep("VERIFY_OTP");
      } catch (err: any) {
        const res = err?.response;
        const data = res?.data;

        if (!res) {
          setErrorMessage("Server error. Please try again.");
          return;
        }

        // ❌ USER NOT FOUND
        if (res.status === 404) {
          setErrorMessage(data.message || "Account not found");
          return;
        }

        // ❌ WRONG PASSWORD
        if (res.status === 401) {
          setErrorMessage(data.message || "Invalid credentials");
          if (typeof data.remainingAttempts === "number") {
            setRemainingAttempts(data.remainingAttempts);
          }
          return;
        }

        // 🔒 ACCOUNT LOCKED
        if (res.status === 423) {
          setErrorMessage(data.message);
          setLockedHours(data.retryAfterHours);
          setIsLocked(true);
          return;
        }

        setErrorMessage(data.message || "Login failed");
      }
      return;
    }

    /* =========================
       VERIFY OTP STEP
    ========================= */
    if (step === "VERIFY_OTP") {
      const otpCode = otp.join("");

      if (!/^\d{6}$/.test(otpCode)) {
        setErrorMessage("Please enter a valid 6-digit OTP.");
        return;
      }

      let res: any;
      try {
        res = await axiosInstance.post("/employee/auth/verify-otp", {
          email,
          otp: otpCode,
        });
      } catch (err: any) {
        const errRes = err?.response;
        setErrorMessage(errRes?.data?.message || "OTP verification failed");
        return;
      }

      if (res.status === 201) {
        router.push("/reset-password?email=" + email);
        return;
      }

      if (res.status === 200) {
        const token = res?.data?.data?.token ?? res?.data?.token ?? null;
        if (!token) {
          setErrorMessage("Login succeeded but no token was returned.");
          return;
        }
        setToken(token);
        router.push("/dashboard");
        return;
      }

      setErrorMessage("Unexpected response from server.");
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await axiosInstance.post("/employee/auth/resend-otp", { email });

      // ✅ SUCCESS MESSAGE
      setSuccessMessage("OTP sent successfully");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setTimeout(() => setResending(false), 3000);
    }
  };


  return (
    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sign In
        </h2>
      </div>

      {/* {step === "SUBMIT" && (
        <button
          type="button"

          className="w-full flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 rounded-lg py-3 mb-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <FcGoogle size={20} />
          <span className="text-sm font-medium text-slate-700 dark:text-white">
            Continue with Google
          </span>
        </button>
      )} */}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="group">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={step === "VERIFY_OTP"}
            placeholder="admin@example.com"
            className={`w-full h-14 px-4 rounded-lg
              bg-slate-50 dark:bg-slate-800/50
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white
              focus:ring-2 focus:ring-primary focus:border-primary
              transition-all
              ${step === "VERIFY_OTP" ? "opacity-70 cursor-not-allowed" : ""}`}
          />
        </div>

        {step === "SUBMIT" && (
          <div className="group">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-14 px-4 rounded-lg
                bg-slate-50 dark:bg-slate-800/50
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-white
                focus:ring-2 focus:ring-primary focus:border-primary
                transition-all"
              />
              {
                showPassword ? (< EyeOffIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" onClick={() => setShowPassword(false)} />)
                  : (<EyeIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" onClick={() => setShowPassword(true)} />)
              }
            </div>


          </div>
        )}

        {/* 🔹 Forgot Password (Independent) */}
        {step === "SUBMIT" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {step === "VERIFY_OTP" && (
          <div className="group">
            <div className="flex justify-between items-end mb-3">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                6-Digit OTP
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-[10px] text-primary hover:underline disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1">
              {otp.map((digit, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/, "");
                      if (!value) return;
                      const newOtp = [...otp];
                      newOtp[index] = value;
                      setOtp(newOtp);
                      if (index < 5)
                        document.getElementById(`otp-${index + 1}`)?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newOtp = [...otp];
                        newOtp[index] = "";
                        setOtp(newOtp);
                        if (index > 0)
                          document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      if (pasted.length === 6) setOtp(pasted.split(""));
                    }}
                    className="w-10 h-10 text-center text-lg font-semibold
                      bg-slate-50 dark:bg-slate-800/50
                      border border-slate-200 dark:border-slate-700
                      rounded-lg text-slate-900 dark:text-white
                      focus:ring-2 focus:ring-primary focus:border-primary
                      transition-all"
                  />
                  {index < otp.length - 1 && (
                    <span className="mx-1 text-slate-400 font-bold select-none">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div
            className={`rounded-lg p-3 text-sm ${isLocked
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
              }`}
          >
            <p>{errorMessage}</p>

            {remainingAttempts !== null && (
              <p className="text-xs mt-1">
                Remaining attempts: <strong>{remainingAttempts}</strong>
              </p>
            )}

            {lockedHours !== null && (
              <p className="text-xs mt-1">
                Try again after <strong>{lockedHours}</strong> hours
              </p>
            )}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg p-3 text-sm bg-green-100 text-green-700">
            {successMessage}
          </div>
        )}

        {/* SUBMIT BUTTON (NEVER BLOCKED) */}

        <button
          type="submit"
          className="w-full bg-primary text-white font-bold py-3 rounded
            transition-all duration-300 active:scale-95"
        >
          {step === "SUBMIT" ? "Submit" : "Verify & Sign In"}
        </button>
      </form>
    </div>
  );
}

