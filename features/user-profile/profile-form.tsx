"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtomValue, useSetAtom } from "jotai"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { profileAtom } from "@/lib/jotai/profile"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const profileUpdateSchema = z
  .object({
    name: z.string().optional(),
    username: z
      .string()
      .optional()
      .refine((val) => !val || /^[a-z]+$/.test(val.trim().toLowerCase()), {
        message:
          "Username can only contain lowercase letters; will be lowercased",
      }),
  })
  .refine((data) => data.name || data.username, {
    message: "At least one field must be provided",
    path: ["name"],
  })

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>

interface ProfileFormProps {
  onSuccess?: () => void
  onReset?: () => void
}

export function ProfileForm({ onSuccess, onReset }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profile = useAtomValue(profileAtom)
  const setProfile = useSetAtom(profileAtom)

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: "",
      username: "",
    },
  })

  // Seed the form with the current profile so users can edit in place
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.fullName ?? "",
        username: profile.username ?? "",
      })
    }
  }, [profile, form])

  const onSubmit = async (data: ProfileUpdateForm) => {
    setIsSubmitting(true)

    try {
      const profileFormData = new FormData()
      profileFormData.append("action", "updateProfile")

      const { dirtyFields } = form.formState
      if (dirtyFields.name && data.name !== undefined) {
        profileFormData.append("name", data.name.trim())
      }
      if (dirtyFields.username && data.username !== undefined) {
        const normalised = data.username.trim().toLowerCase()
        // Avoid violating DB checks with empty string; either skip or handle as null server-side.
        if (normalised.length > 0) {
          profileFormData.append("username", normalised)
        }
      }

      const profileResponse = await fetch("/profile/update-profile", {
        method: "POST",
        body: profileFormData,
      })

      if (!profileResponse.ok) {
        const profileResult = await profileResponse.json()
        throw new Error(profileResult.error || "Failed to update profile")
      }

      // Get the updated profile data
      const profileResult = await profileResponse.json()

      // Update the profile atom with the new data
      if (profileResult.data) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                fullName: profileResult.data.full_name ?? prev.fullName,
                username: profileResult.data.username ?? prev.username,
              }
            : null
        )
      }

      toast.success("Profile updated successfully!")
      form.reset()
      onSuccess?.()
      onReset?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder={profile?.fullName || "Enter your name"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder={profile?.username || "Enter your username"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
