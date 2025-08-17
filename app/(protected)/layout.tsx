import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/widgets/sidebar/app-sidebar"
import { SidebarHeader } from "@/components/widgets/sidebar/sidebar-header"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen">
          <SidebarHeader />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
