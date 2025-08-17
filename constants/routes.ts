import {
  IconDashboard,
  IconFiles,
  IconLayoutGrid,
  IconLifebuoy,
  IconSend,
  IconSettings,
  type TablerIcon,
} from "@tabler/icons-react"

type Route = {
  label: string
  path: string
  allowSubpaths?: boolean
}

export interface Routes {
  error: Route[]
  marketing: Route[]
  documentation: Route[]
  auth: Route[]
  protected: Route[]
  customers: Route[]
}

export interface SidebarItem {
  title: string
  url: string
  icon: TablerIcon
  allowSubpaths?: boolean
  items?: ReadonlyArray<{
    title: string
    url: string
  }>
}

export interface SidebarData {
  readonly navMain: ReadonlyArray<SidebarItem>
  readonly navSecondary: ReadonlyArray<SidebarItem>
}

// Centralized sidebar navigation data - the single source of truth
export const sidebarData: SidebarData = {
  navMain: [
    {
      title: "Overview",
      url: "/overview",
      icon: IconDashboard,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: IconFiles,
      allowSubpaths: true,
      items: [
        {
          title: "Create",
          url: "/invoices/create",
        },
        {
          title: "List",
          url: "/invoices",
        },
        {
          title: "Payments",
          url: "/invoices/payments",
        },
      ],
    },
    {
      title: "Products",
      url: "/products",
      icon: IconLayoutGrid,
      allowSubpaths: true,
      items: [
        {
          title: "Create",
          url: "/products/create",
        },
        {
          title: "List",
          url: "/products",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
      allowSubpaths: true,
      items: [
        {
          title: "Templates",
          url: "/settings/templates",
        },
        {
          title: "Tax Rates",
          url: "/settings/tax-rates",
        },
        {
          title: "Team Members",
          url: "/settings/team-members",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: IconLifebuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: IconSend,
    },
  ],
}

export const routes: Routes = {
  error: [
    {
      label: "Auth Error",
      path: "/auth/error",
    },
  ],
  marketing: [
    {
      label: "Home",
      path: "/",
    },
  ],
  documentation: [
    {
      label: "Docs",
      path: "/docs",
      allowSubpaths: true,
    },
    {
      label: "Code Showcase",
      path: "/docs/code-showcase",
    },
    {
      label: "Image Showcase",
      path: "/docs/image-showcase",
    },
    {
      label: "Lorem Ipsum",
      path: "/docs/lorem-ipsum",
    },
    {
      label: "Table Showcase",
      path: "/docs/table-showcase",
    },
    {
      label: "Typography Showcase",
      path: "/docs/typography-showcase",
    },
  ],
  auth: [
    {
      label: "OTP and Social Confirmation",
      path: "/auth/confirm",
    },
    {
      label: "Login",
      path: "/auth/login",
    },
  ],
  protected: [
    {
      label: "Profile",
      path: "/profile",
      allowSubpaths: true,
    },
  ],
  customers: [
    {
      label: "Sarah Johnson",
      path: "/customers/sarah-johnson",
    },
    {
      label: "Michael Chen",
      path: "/customers/michael-chen",
    },
    {
      label: "Emily Rodriguez",
      path: "/customers/emily-rodriguez",
    },
    {
      label: "David Thompson",
      path: "/customers/david-thompson",
    },
    {
      label: "Lisa Park",
      path: "/customers/lisa-park",
    },
    {
      label: "James Wilson",
      path: "/customers/james-wilson",
    },
    {
      label: "Maria Garcia",
      path: "/customers/maria-garcia",
    },
    {
      label: "Robert Kim",
      path: "/customers/robert-kim",
    },
  ],
}

// Centralized home route constant
export const homeRoute =
  routes.marketing.find((r) => r.path === "/")?.path || "/"

// Utility function to check if a route is active, respecting allowSubpaths
export function isRouteActive(
  currentPath: string,
  routePath: string,
  allowSubpaths?: boolean
): boolean {
  // Special-case root to avoid making every path active
  if (routePath === "/") {
    return currentPath === "/"
  }

  // Normalise to handle accidental trailing slashes in config or path
  const normalize = (p: string) =>
    p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p

  if (normalize(currentPath) === normalize(routePath)) return true

  if (allowSubpaths) {
    // For routes that allow subpaths, check if current path starts with the route path
    // but ensure we're at a segment boundary (not just a partial match)
    const base = normalize(routePath)
    return currentPath.startsWith(base + "/")
  }

  return false
}
