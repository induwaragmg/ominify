'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  Home,
  ShoppingBag,
  Zap,
  Package,
  Heart,
  Settings,
  HelpCircle,
  Moon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: ShoppingBag,
  },
  {
    title: "Deals",
    url: "/deals",
    icon: Zap,
    badge: "Hot",
  },
  {
    title: "My Orders",
    url: "/orders",
    icon: Package,
  },
  {
    title: "Wishlist",
    url: "/wishlist",
    icon: Heart,
  },
  {
    title: "Settings",
    url: "/account",
    icon: Settings,
  },
]

export function AppSidebar(): JSX.Element {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" className=" bg-[#f8f9fb] py-3 pl-3">
      <SidebarHeader className="px-4 py-6">
         <Link href="/" className="flex items-center h-12">
        <Image
          src="/logo.svg"
          alt="Ominify"
          width={300}
          height={60}
          className="h-full w-auto"
        />
      </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <div className="space-y-2">
            {items.map((item) => {
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname === item.url || pathname.startsWith(`${item.url}/`)

              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-brand text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <span className="text-sm font-bold flex-1">{item.title}</span>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-white text-brand"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </SidebarGroup>

        {/* Special Offer */}
        <SidebarGroup className="">
          <div className="bg-linear-to-br from-brand via-blue-500 to-green-200 text-white rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2">Summer Sale</h3>
            <p className="text-sm mb-3">Up to 50% Off</p>
            <button className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </div>
        </SidebarGroup>

        {/* Need Help */}
        <SidebarGroup className="">
          <div className="flex items-center gap-2 px-4 py-3 text-gray-700">
            <HelpCircle className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">Need Help?</p>
              <p className="text-xs text-gray-500">24/7 Support Center</p>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-6">
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
            <Moon className="w-5 h-5" />
            <span className="text-sm font-medium">Light Mode</span>
          </div>
          <span className="text-lg">›</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
