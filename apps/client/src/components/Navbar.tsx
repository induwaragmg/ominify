import Link from "next/link";
import SearchBar from "./SearchBar";
import { Bell, Home } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import { Show } from "@clerk/nextjs";
import ProfileButton from "./ProfileButton";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = (): JSX.Element => {
  return (
    <div className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
      <div className="w-full flex items-center justify-between gap-3 border-gray-200 py-4">
        {/* Left: Mobile sidebar trigger */}
        <SidebarTrigger className="md:hidden h-10 w-10 shrink-0 rounded-full bg-white text-gray-500 shadow-sm" />

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

          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="flex shrink-0 items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-brand-hover"
            >
              Sign Up
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
