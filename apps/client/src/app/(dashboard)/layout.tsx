import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="mr-8 flex-1 min-w-0">
        <div className="sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}