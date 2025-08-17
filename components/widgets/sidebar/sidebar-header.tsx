"use client"

import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SidebarHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Don't render breadcrumbs for the home page
  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>
    )
  }

  // Format segment names for display
  const formatSegment = (segment: string) => {
    let s = segment
    try {
      s = decodeURIComponent(segment)
    } catch {
      // no-op
    }
    // Convert kebab-case or snake_case to Title Case
    return s.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}`
              const isLast = index === segments.length - 1
              const displayName = formatSegment(segment)

              return (
                <BreadcrumbItem key={href}>
                  {isLast ? (
                    <BreadcrumbPage>{displayName}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{displayName}</BreadcrumbLink>
                  )}
                  {!isLast && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
