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
    <SidebarProvider className="">
      <AppSidebar />

      {/* CHANGE: Use SidebarInset as the main content wrapper. */}
      <SidebarInset className="bg-[#f8f9fb] pl-2 pr-2 ">
        <div>
          <div className="flex flex-1 min-w-0">

            <div className="flex flex-1 min-w-0 flex-col ">
              <Navbar />
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
            <RightSidebar />
          </div>
          <Footer />

        </div>

      </SidebarInset>
    </SidebarProvider>
  );
}