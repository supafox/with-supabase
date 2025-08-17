"use client"

import { useLogout } from "@/shared/hooks/use-logout"
import {
  UserAvatar,
  UserDisplayName,
  UserEmail,
} from "@/shared/ui/user-profile"
import {
  IconBell,
  IconCreditCard,
  IconLogout,
  IconSelector,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { handleLogout, isLoggingOut } = useLogout()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar />
              <div className="text-copy-14 grid flex-1 text-left leading-tight">
                <span className="truncate">
                  <UserDisplayName />
                </span>
                <span className="text-copy-12 truncate">
                  <UserEmail />
                </span>
              </div>
              <IconSelector className="ml-auto size-4" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0">
              <div className="text-copy-14 flex items-center gap-2 px-1 py-1.5 text-left">
                <UserAvatar />
                <div className="text-copy-14 grid flex-1 text-left leading-tight">
                  <span className="truncate">
                    <UserDisplayName />
                  </span>
                  <span className="text-copy-12 truncate">
                    <UserEmail />
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <IconSparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <IconShieldCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <IconBell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <IconLogout />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
