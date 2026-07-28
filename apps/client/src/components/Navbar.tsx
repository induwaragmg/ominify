"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { Bell, Home, Sparkles } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import { Show } from "@clerk/nextjs";
import ProfileButton from "./ProfileButton";
import { SidebarTrigger } from "./ui/sidebar";
import useWorkspaceUIStore from "@/stores/workspaceUIStore";

const Navbar = (): JSX.Element => {
  const { toggleAssistant, isAssistantOpen, isMobileOpen } = useWorkspaceUIStore();
  const isOpen = isAssistantOpen || isMobileOpen;

  return (
    <div className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
      <div className="w-full flex items-center justify-between gap-3 border-gray-200 py-4">
        {/* Left: Mobile sidebar trigger matching exact 40px circle & 20px icon size */}
        <SidebarTrigger className="md:hidden h-10 w-10 shrink-0 rounded-full bg-white text-gray-500 hover:text-gray-900 shadow-sm p-0 flex items-center justify-center [&_svg]:size-5 [&_svg]:h-5 [&_svg]:w-5" />

        {/* Center: Search Bar */}
        <SearchBar />

        {/* Right: Actions aligned on center */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Home button */}
          <Link
            href="/"
            className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-gray-900"
            title="Home"
          >
            <Home className="h-5 w-5" />
          </Link>

          {/* Bell notification button */}
          <button
            type="button"
            className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-gray-900 cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* AI Assistant button */}
          <button
            type="button"
            onClick={toggleAssistant}
            className={`hidden sm:flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-medium shadow-sm transition cursor-pointer ${
              isOpen
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-white text-gray-600 hover:text-blue-600 hover:shadow-md"
            }`}
            title="AI Assistant"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Assistant</span>
          </button>

          {/* Mobile-only AI icon button */}
          <button
            type="button"
            onClick={toggleAssistant}
            className={`flex sm:hidden shrink-0 h-10 w-10 items-center justify-center rounded-full shadow-sm transition cursor-pointer ${
              isOpen
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500 hover:text-blue-600"
            }`}
            title="AI Assistant"
          >
            <Sparkles className="h-5 w-5" />
          </button>

          {/* Shopping Cart Icon */}
          <ShoppingCartIcon />

          {/* Signed-out Auth Buttons */}
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="flex shrink-0 items-center justify-center rounded-full bg-surface ring-1 ring-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-brand hover:text-white"
            >
              Sign In
            </Link>
          </Show>

          {/* Signed-in User Profile */}
          <Show when="signed-in">
            <ProfileButton />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

