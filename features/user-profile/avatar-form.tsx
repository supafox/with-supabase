"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { toast } from "sonner"

import { profileAtom } from "@/lib/jotai/profile"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Helper functions for safe JSON parsing
function isJsonResponse(response: Response): boolean {
  const ct = response.headers.get("content-type") || ""
  return ct.includes("application/json")
}

async function safeJson<T = unknown>(response: Response): Promise<T | null> {
  // 204/205 explicitly indicate no body
  if (response.status === 204 || response.status === 205) return null
  if (!isJsonResponse(response)) return null
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export function AvatarForm() {
  const [isAvatarDeleting, setIsAvatarDeleting] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/heic",
    "image/heif",
  ])
  const activeAbortRef = useRef<AbortController | null>(null)
  const profile = useAtomValue(profileAtom)
  const setProfile = useSetAtom(profileAtom)
  const isBusy = isAvatarUploading || isAvatarDeleting
  const inputId = useId()
  const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

  // Update temp preview when avatar changes using local state
  useEffect(() => {
    if (selectedAvatar) {
      const url = URL.createObjectURL(selectedAvatar)
      setPreviewUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [selectedAvatar])

  // Abort any in-flight avatar requests on unmount
  useEffect(() => {
    return () => {
      activeAbortRef.current?.abort()
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type (fallback for browsers that omit file.type)
    const isAllowedType = file.type
      ? ALLOWED_IMAGE_MIME_TYPES.has(file.type)
      : /\.(jpe?g|png|gif|webp|avif|heic|heif)$/i.test(file.name)
    if (!isAllowedType) {
      toast.error(
        "Please select a valid raster image (jpg, png, gif, webp, avif, heic)"
      )
      event.target.value = ""
      return
    }

    // Validate file size (5 MB limit)
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("File size must be less than 5MB")
      event.target.value = ""
      return
    }

    // Set the selected avatar
    setSelectedAvatar(file)
  }

  const handleRemoveFile = () => {
    setSelectedAvatar(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) return

    setIsAvatarUploading(true)

    try {
      // Abort any previous in-flight request and create a fresh controller
      activeAbortRef.current?.abort()
      const controller = new AbortController()
      activeAbortRef.current = controller

      const formData = new FormData()
      formData.append("action", "uploadAvatar")
      formData.append("file", selectedAvatar)

      const response = await fetch("/profile/update-profile", {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })

      const result = await safeJson<{
        data?: { avatar_url?: string }
        error?: string
      }>(response)

      if (!response.ok) {
        const message =
          (result &&
            typeof result === "object" &&
            "error" in result &&
            result.error) ||
          "Failed to upload avatar"
        throw new Error(String(message))
      }

      // Update the profile atom with the new avatar URL
      const avatarUrl = result?.data?.avatar_url
      if (avatarUrl) {
        setProfile((prev) => (prev ? { ...prev, avatarUrl } : null))
      }

      toast.success("Avatar uploaded successfully!")

      // Clear the selected avatar and preview
      setSelectedAvatar(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // Ignore aborted requests (component unmounted or superseded)
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload avatar"
        )
      }
    } finally {
      activeAbortRef.current = null
      setIsAvatarUploading(false)
    }
  }

  const handleAvatarDelete = async () => {
    setIsAvatarDeleting(true)

    try {
      // Abort any previous in-flight request and create a fresh controller
      activeAbortRef.current?.abort()
      const controller = new AbortController()
      activeAbortRef.current = controller

      const formData = new FormData()
      formData.append("action", "deleteAvatar")

      const response = await fetch("/profile/update-profile", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      const result = await safeJson<{ error?: string; message?: string }>(
        response
      )

      if (response.ok) {
        // Check if there was actually an avatar to delete
        if (result && result.message === "No avatar to delete") {
          toast.info("No avatar to delete")
        } else {
          toast.success("Avatar deleted successfully!")

          // Update the profile atom
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  avatarUrl: null,
                }
              : null
          )
        }
      } else {
        const errorMessage =
          (result &&
            typeof result === "object" &&
            "error" in result &&
            result.error) ||
          "Failed to delete avatar"
        toast.error(errorMessage)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // Ignore aborted requests (component unmounted or superseded)
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      activeAbortRef.current = null
      setIsAvatarDeleting(false)
    }
  }

  const initial =
    profile?.fullName?.trim?.()?.[0]?.toUpperCase() ??
    profile?.email?.trim?.()?.[0]?.toUpperCase() ??
    "?"

  return (
    <div className="space-y-4">
      <Label htmlFor={inputId}>Profile Picture</Label>
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center">
        {/* Avatar Preview - Local preview or current profile avatar */}
        <div className="flex-shrink-0">
          <div className="bg-muted flex size-16 items-center justify-center overflow-hidden rounded-full">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                width={64}
                height={64}
                alt="Avatar preview"
                className="size-full object-cover"
                decoding="async"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt="Current avatar"
                className="size-full object-cover"
                width={64}
                height={64}
                decoding="async"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="from-primary/20 to-secondary/20 flex size-full items-center justify-center bg-gradient-to-br">
                <span className="text-primary text-copy-18">{initial}</span>
              </div>
            )}
          </div>
        </div>

        {/* File Input and Controls */}
        <div className="w-full flex-1 space-y-2 text-center lg:w-auto lg:text-left">
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif"
              onChange={handleFileSelect}
              disabled={isBusy}
              className="hidden"
              id={inputId}
            />

            {!selectedAvatar ? (
              <Button
                type="button"
                variant="outline"
                className="w-full lg:w-auto"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
              >
                Choose File
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleAvatarUpload}
                disabled={isBusy}
                className="w-full lg:w-auto"
              >
                {isAvatarUploading ? "Uploading..." : "Save Image"}
              </Button>
            )}

            {selectedAvatar && (
              <Button
                type="button"
                variant="outline"
                className="w-full lg:w-auto"
                onClick={handleRemoveFile}
                disabled={isBusy}
              >
                Remove
              </Button>
            )}

            {profile?.avatarUrl && !selectedAvatar && (
              <Button
                type="button"
                variant="outline"
                className="w-full lg:w-auto"
                onClick={handleAvatarDelete}
                disabled={isBusy}
              >
                {isAvatarDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
