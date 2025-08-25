"use client"

import { UserProfileDialog } from "@/features/user-profile/user-profile-dialog"
import { useLogout } from "@/shared/hooks/use-logout"
import { UserAvatar, UserDisplayName, UserName } from "@/shared/ui/user-profile"
import { IconLogout } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export function UserProfile() {
  const { handleLogout, isLoggingOut } = useLogout()
  return (
    <div className="flex w-full flex-col items-center justify-between p-4 md:flex-row">
      <div className="flex flex-col items-center gap-6 pb-6 md:flex-row md:gap-12 md:pb-0">
        <UserAvatar className="size-16" />
        <div className="flex flex-col text-center md:text-left">
          <UserDisplayName />
          <h2 className="heading-20">
            <UserName />
          </h2>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <UserProfileDialog />
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full lg:w-fit"
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          type="button"
        >
          <IconLogout aria-hidden="true" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </div>
  )
}
