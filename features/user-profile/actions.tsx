import "server-only"

import { createClient } from "@/lib/supabase/server"

export type ActionResult = { error: string } | { data: unknown } | null

export async function updateUserProfile(formData: FormData) {
  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const normalisedUsername = username ? username.trim().toLowerCase() : username
  const supabase = await createClient()

  // Get the current user
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    return null
  }
  const user = authData.user
  const userId = user.id

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Only update fields that are provided
  const updateData: { full_name?: string; username?: string } = {}
  if (name) updateData.full_name = name
  if (normalisedUsername) updateData.username = normalisedUsername

  if (Object.keys(updateData).length === 0) {
    return { error: "No fields to update" }
  }

  // Check username uniqueness if username is being updated
  if (normalisedUsername) {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalisedUsername)
      .neq("id", userId)
      .maybeSingle()

    if (existingUser) {
      return { error: "Username already taken" }
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    // Postgres duplicate key violation code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "23505") {
      return { error: "Username already taken" }
    }
    return { error: error.message }
  }

  return { data }
}

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("file")
  const supabase = await createClient()

  // Validate file exists and is a File object
  if (!file || !(file instanceof File)) {
    return { error: "No file provided" }
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return { error: "File size must be less than 5MB" }
  }

  // Validate MIME type
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ]
  if (file.type && !allowedMimeTypes.includes(file.type)) {
    return { error: "Only JPEG, PNG, GIF, and WebP images are allowed" }
  }

  // Validate file extension
  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"]
  const lastDotIndex = file.name.lastIndexOf(".")
  const fileExt =
    lastDotIndex > 0 ? file.name.slice(lastDotIndex + 1).toLowerCase() : ""

  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    return { error: "Invalid file extension" }
  }

  // Validate file content (magic bytes)
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  const len = bytes.length
  const isJpeg =
    len > 2 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const isPng =
    len > 3 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  const isGif =
    len > 2 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46
  const isWebP =
    len > 11 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  const isValidImage = isJpeg || isPng || isGif || isWebP

  if (!isValidImage) {
    return { error: "Invalid image file" }
  }

  // Get the current user
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    return null
  }
  const user = authData.user
  const userId = user.id

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Generate unique filename
  const fileName = `${userId}-${Date.now()}.${fileExt}`

  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true,
    })
  if (uploadError) {
    // Best-effort cleanup to avoid orphaned file
    await supabase.storage.from("avatars").remove([fileName])
    return { error: uploadError.message }
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName)

  // Update the user's profile with the new avatar URL
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", userId)
    .select()
    .single()

  if (profileError) {
    return { error: profileError.message }
  }

  return { data: profileData }
}

export async function deleteAvatar() {
  const supabase = await createClient()

  // Get the current user
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    return null
  }
  const user = authData.user
  const userId = user.id

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get current avatar URL
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single()

  if (profileError) {
    return { error: profileError.message }
  }

  if (profile.avatar_url) {
    // Extract filename from URL more robustly
    const url = new URL(profile.avatar_url)
    const pathParts = url.pathname.split("/")
    const fileName = pathParts[pathParts.length - 1]

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([fileName])

    if (deleteError) {
      return { error: deleteError.message }
    }

    // Update profile to remove avatar URL
    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      return { error: updateError.message }
    }

    return { data: updateData }
  } else {
    // Nothing to delete; return a benign success payload
    return { data: null }
  }
}
