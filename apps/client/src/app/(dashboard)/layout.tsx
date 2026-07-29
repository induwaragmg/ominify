import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Workspace from "@/components/Workspace/Workspace";
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

      <SidebarInset className="bg-[#f8f9fb] pl-2 pr-3">
        <div>
          <div className="flex flex-1 min-w-0">
            <div className="flex flex-1 min-w-0 flex-col">
              <Navbar />
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
            <Workspace />
          </div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}