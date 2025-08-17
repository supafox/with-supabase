"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { AvatarForm } from "./avatar-form"
import { ProfileForm } from "./profile-form"

export function UserProfileDialog() {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const handleProfileSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Avatar Section */}
        <div className="space-y-4">
          <AvatarForm />
        </div>

        <Separator />

        {/* Profile Fields Section */}
        <div className="space-y-4">
          <ProfileForm onSuccess={handleProfileSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
