import Footer from "@/components/widgets/footer"
import Nav from "@/components/widgets/navbar/nav"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <main className="min-h-screen flex-1">{children}</main>
      <Footer />
    </>
  )
}
