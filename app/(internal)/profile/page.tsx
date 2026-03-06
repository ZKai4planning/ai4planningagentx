"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import axios from "axios"
import axiosInstance from "@/lib/axiosinstance"
import { useAuthStore } from "@/lib/zustand"

type EmployeeProfile = {
  _id: string
  profileId: string
  userRefId: string
  name: string
  email: string
  phoneNumber: string
  profilePicture: string
  createdAt: string
  updatedAt: string
}

type UnknownRecord = Record<string, unknown>

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=Employee&background=e2e8f0&color=334155&size=256"

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function pickApiMessage(data: unknown): string | null {
  if (!isRecord(data)) return null
  const message = data.message
  return typeof message === "string" && message.trim().length > 0 ? message : null
}

function toProfile(value: unknown): EmployeeProfile | null {
  if (!isRecord(value)) return null

  const name = value.name
  const email = value.email
  const phoneNumber = value.phoneNumber

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phoneNumber !== "string"
  ) {
    return null
  }

  return {
    _id: typeof value._id === "string" ? value._id : "",
    profileId: typeof value.profileId === "string" ? value.profileId : "",
    userRefId: typeof value.userRefId === "string" ? value.userRefId : "",
    name,
    email,
    phoneNumber,
    profilePicture:
      typeof value.profilePicture === "string" ? value.profilePicture : "",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  }
}

function extractProfile(payload: unknown): EmployeeProfile | null {
  const queue: unknown[] = [payload]
  const visited = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (current === undefined || visited.has(current)) continue
    visited.add(current)

    const candidate = toProfile(current)
    if (candidate) return candidate

    if (isRecord(current)) {
      if ("data" in current) queue.push(current.data)
      if ("profile" in current) queue.push(current.profile)
      if ("result" in current) queue.push(current.result)
    }
  }

  return null
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback
  return pickApiMessage(error.response?.data) ?? fallback
}

async function uploadProfilePicture(
  userId: string,
  formData: FormData
) {
  const endpoint = `/employee/profile/${encodeURIComponent(userId)}/picture`

  try {
    return await axiosInstance.put(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 405) {
      return axiosInstance.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    }
    throw error
  }
}

export default function EmployeeProfilePage() {
  const userId = useAuthStore((state) => state.userId)
  const authEmail = useAuthStore((state) => state.email)
  const setProfileName = useAuthStore((state) => state.setProfileName)

  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [pictureMessage, setPictureMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const avatarSrc = useMemo(() => {
    if (profile?.profilePicture && profile.profilePicture.trim().length > 0) {
      return profile.profilePicture
    }

    const baseName = name.trim() || authEmail?.split("@")[0] || "Employee"
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      baseName
    )}&background=e2e8f0&color=334155&size=256`
  }, [authEmail, name, profile?.profilePicture])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false)
        setFetchError("No user id found. Please login again.")
        return
      }

      setLoading(true)
      setFetchError(null)

      try {
        const response = await axiosInstance.get(
          `/employee/profile/${encodeURIComponent(userId)}`
        )
        const nextProfile = extractProfile(response.data)

        if (!nextProfile) {
          setFetchError("Profile response is invalid.")
          return
        }

        setProfile(nextProfile)
        setName(nextProfile.name)
        setEmail(nextProfile.email)
        setPhoneNumber(nextProfile.phoneNumber)
        setProfileName(nextProfile.name)
      } catch (error) {
        setFetchError(getErrorMessage(error, "Failed to fetch profile."))
      } finally {
        setLoading(false)
      }
    }

    void fetchProfile()
  }, [userId])

  const handleDetailsSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!userId) {
      setSaveMessage("No user id found. Please login again.")
      return
    }

    setSaveMessage(null)
    setIsSaving(true)

    try {
      const payload = { name, email, phoneNumber }
      const response = await axiosInstance.put(
        `/employee/profile/${encodeURIComponent(userId)}`,
        payload
      )

      const nextProfile = extractProfile(response.data)
      if (nextProfile) {
        setProfile(nextProfile)
        setName(nextProfile.name)
        setEmail(nextProfile.email)
        setPhoneNumber(nextProfile.phoneNumber)
        setProfileName(nextProfile.name)
      } else {
        setProfile((prev) =>
          prev
            ? { ...prev, name: payload.name, email: payload.email, phoneNumber: payload.phoneNumber }
            : prev
        )
        setProfileName(payload.name)
      }

      setSaveMessage("Profile details updated successfully.")
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Failed to update profile details."))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setPictureMessage(null)
  }

  const handlePictureUpload = async () => {
    if (!userId) {
      setPictureMessage("No user id found. Please login again.")
      return
    }

    if (!selectedFile) {
      setPictureMessage("Please choose a picture before uploading.")
      return
    }

    setIsUploading(true)
    setPictureMessage(null)

    try {
      const formData = new FormData()
      formData.append("profilePicture", selectedFile)

      const response = await uploadProfilePicture(userId, formData)
      const nextProfile = extractProfile(response.data)

      if (nextProfile) {
        setProfile(nextProfile)
      }

      setSelectedFile(null)
      setPictureMessage("Profile picture uploaded successfully.")
    } catch (error) {
      setPictureMessage(getErrorMessage(error, "Failed to upload picture."))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Employee Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your profile details and profile picture.
            </p>
          </div>
          <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
            User ID: {userId ?? "Unavailable"}
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-sm text-slate-500">Loading profile...</div>
        ) : fetchError ? (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {fetchError}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <section className="rounded-xl border bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-800">Profile Picture</h2>
              <div className="mt-4 flex flex-col items-center gap-4">
                <Image
                  src={avatarSrc || DEFAULT_AVATAR}
                  alt="Employee profile picture"
                  className="h-36 w-36 rounded-full border object-cover"
                  width={144}
                  height={144}
                  unoptimized
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700"
                />

                <button
                  type="button"
                  onClick={handlePictureUpload}
                  disabled={isUploading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isUploading ? "Uploading..." : "Upload Picture"}
                </button>

                {selectedFile && (
                  <p className="text-xs text-slate-500">Selected: {selectedFile.name}</p>
                )}

                {pictureMessage && (
                  <p className="text-xs text-slate-600 text-center">{pictureMessage}</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border p-4">
              <h2 className="text-sm font-semibold text-slate-800">Profile Details</h2>
              <form className="mt-4 space-y-4" onSubmit={handleDetailsSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    required
                    placeholder="Enter name"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="Enter email"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Phone Number</label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                    required
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  {saveMessage && <p className="text-sm text-slate-600">{saveMessage}</p>}
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
