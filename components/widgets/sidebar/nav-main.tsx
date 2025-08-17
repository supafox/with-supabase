"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { isRouteActive, type SidebarItem } from "@/constants/routes"
import { IconChevronRight } from "@tabler/icons-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  groupLabel = "Platform",
}: {
  items: ReadonlyArray<SidebarItem>
  groupLabel?: string
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Allow nested paths when explicitly enabled, or by default when children exist.
          // Note: If allowSubpaths is false, exact child matches still activate the group,
          // but deeper nested paths do not.
          const allowNested = item.allowSubpaths ?? Boolean(item.items?.length)
          const childExactMatch =
            item.items?.some((child) => pathname === child.url) ?? false
          const childNestedMatch =
            item.items?.some((child) =>
              isRouteActive(pathname, child.url, true)
            ) ?? false
          const groupActive =
            isRouteActive(pathname, item.url, allowNested) ||
            (allowNested ? childNestedMatch : childExactMatch)
          return (
            <Collapsible
              key={`${item.url}-${groupActive ? "open" : "closed"}`}
              asChild
              defaultOpen={groupActive}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={groupActive}
                >
                  <Link
                    href={item.url}
                    aria-current={
                      isRouteActive(pathname, item.url, false)
                        ? "page"
                        : undefined
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <IconChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const subItemActive = isRouteActive(
                            pathname,
                            subItem.url,
                            allowNested
                          )
                          return (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItemActive}
                                aria-current={
                                  isRouteActive(pathname, subItem.url, false)
                                    ? "page"
                                    : undefined
                                }
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
