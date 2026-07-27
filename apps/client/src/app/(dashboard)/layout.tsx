import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* CHANGE: Use SidebarInset instead of a custom wrapper. */}
      <SidebarInset className="bg-[#f8f9fb] pl-2 pr-3">

        {/* CHANGE: Make the content occupy the available height. */}
        <div className="flex flex-1 flex-col">

          <Navbar />

          {/* CHANGE: Allow dashboard pages to grow. */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          <Footer />

        </div>

      </SidebarInset>
    </SidebarProvider>
  );
}