"use client"

import * as React from "react"
import Link from "next/link"
import { homeRoute, routes, sidebarData } from "@/constants/routes"
import { IconCommand, IconUser } from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavCustomers } from "@/components/widgets/sidebar/nav-customers"
import { NavMain } from "@/components/widgets/sidebar/nav-main"
import { NavSecondary } from "@/components/widgets/sidebar/nav-secondary"
import { NavUser } from "@/components/widgets/sidebar/nav-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Home route centralised in constants
  // const homeRoute is imported

  // Get customer routes from constants
  const customers = routes.customers.map((customer) => ({
    name: customer.label,
    url: customer.path,
    icon: IconUser,
  })) satisfies React.ComponentProps<typeof NavCustomers>["customers"]

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeRoute}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <IconCommand
                    className="size-4"
                    aria-hidden="true"
                    focusable="false"
                  />
                </div>
                <div className="copy-14 grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">Acme Corporation</span>
                  <span className="copy-12 truncate">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavCustomers customers={customers} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
