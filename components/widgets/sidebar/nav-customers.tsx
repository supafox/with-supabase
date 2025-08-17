"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconChevronDown,
  IconDots,
  IconFolder,
  IconShare,
  IconTrash,
  type TablerIcon,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Shared type for customer items
interface Customer {
  name: string
  url: string
  icon: TablerIcon
}

async function shareCustomerLink(
  customerUrl: string,
  customerName: string
): Promise<void> {
  const copyToClipboard = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(customerUrl)
      toast.success("Customer link copied to clipboard")
    } else {
      toast.info("Sharing not supported. Please copy the link manually.")
    }
  }

  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      (typeof navigator.canShare !== "function" ||
        navigator.canShare({ url: customerUrl }))
    ) {
      await navigator.share({ url: customerUrl, title: customerName })
      return
    }
    await copyToClipboard()
  } catch (error) {
    console.error("Error sharing customer:", error)
    try {
      await copyToClipboard()
    } catch {
      toast.error("Share failed. Please copy the link manually.")
    }
  }
}

interface CustomerActionsProps {
  item: Customer
  isMobile: boolean
}

function CustomerActions({ item, isMobile }: CustomerActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: Implement delete functionality
      console.log(`Delete customer: ${item.name}`)
      toast.success(`Customer &quot;${item.name}&quot; deleted successfully`)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Failed to delete customer. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover>
            <IconDots />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem asChild>
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
              <IconFolder className="text-muted-foreground" />
              <span>View Customer</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => shareCustomerLink(item.url, item.name)}
          >
            <IconShare className="text-muted-foreground" />
            <span>Share Customer</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            onSelect={(e) => e.preventDefault()}
          >
            <IconTrash className="text-muted-foreground" />
            <span>Delete Customer</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{item.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function NavCustomers({ customers }: { customers: Customer[] }) {
  const { isMobile } = useSidebar()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const pathname = usePathname()

  const initialCustomers = customers.slice(0, 3)
  const remainingCustomers = customers.slice(3)
  const hasMoreCustomers = remainingCustomers.length > 0

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Customers</SidebarGroupLabel>
      <SidebarMenu>
        {initialCustomers.map((item) => {
          const isActive = pathname === item.url
          return (
            <SidebarMenuItem key={`${item.name}-${item.url}`}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link
                  href={item.url}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <CustomerActions item={item} isMobile={isMobile} />
            </SidebarMenuItem>
          )
        })}

        {hasMoreCustomers && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent>
              {remainingCustomers.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={`${item.name}-${item.url}`}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.url}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <CustomerActions item={item} isMobile={isMobile} />
                  </SidebarMenuItem>
                )
              })}
            </CollapsibleContent>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                {isExpanded
                  ? "Show Less"
                  : remainingCustomers.length === 1
                    ? "Show 1 More Customer"
                    : `Show ${remainingCustomers.length} More Customers`}
                <IconChevronDown
                  className={`ml-auto transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </Collapsible>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
