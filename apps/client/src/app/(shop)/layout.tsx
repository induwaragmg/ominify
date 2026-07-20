import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RightSidebar from "@/components/RightSidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="mr-8">
        <div className="flex">
          <div className="flex-1 min-w-0 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
            <Navbar />
            {children}
            <Footer />
          </div>

          <RightSidebar />
        </div>
      </div>
    </SidebarProvider>
  );
}