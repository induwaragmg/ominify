import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RightSidebar from "@/components/RightSidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* CHANGE: Use SidebarInset as the main content wrapper. */}
      <SidebarInset>

        {/* CHANGE: Layout for page content and right sidebar. */}
        <div className="flex flex-1 min-w-0">

          {/* CHANGE: Main content column. */}
          <div className="flex flex-1 min-w-0 flex-col">

            <Navbar />

            {/* CHANGE: Allow page content to grow and shrink correctly. */}
            <main className="flex-1 min-w-0">
              {children}
            </main>

            <Footer />

          </div>

          {/* CHANGE: Right sidebar remains beside the main content. */}
          <RightSidebar />

        </div>

      </SidebarInset>
    </SidebarProvider>
  );
}