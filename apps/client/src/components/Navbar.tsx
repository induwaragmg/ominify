import Image from "next/image"
import Link from "next/link"
import SearchBar from "./SearchBar";
import { Bell, Home, ShoppingCart } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import ProfileButton from "./ProfileButton";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  return (
    <div className="sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
    <div className="w-full flex items-center justify-between gap-4  border-gray-200 py-4">
      {/* Left */}
     
      {/* <Link href="/" className="flex items-center h-12">
        <Image
          src="/logo.svg"
          alt="Ominify"
          width={300}
          height={60}
          className="h-full w-auto"
        />
      </Link> */}
      {/* Right */}
        <SidebarTrigger className="md:hidden h-10 w-10 shrink-0 rounded-full bg-white text-gray-500 shadow-sm" />
        <SearchBar  />
      <div className="flex items-center gap-4">
        <Link href="/">
          <Home className="w-10 h-10 text-gray-500 bg-white  p-2 rounded-full shadow-sm" />
        </Link>
        <Bell className="w-10 h-10 text-gray-500  bg-white  p-2 rounded-full shadow-sm hover:cursor-pointer" />
        <ShoppingCartIcon />
        {/* <button className="text-white hover:cursor-pointer bg-accent  rounded-full px-3 py-1 text-md hover:text-white hover:bg-accent-light transition-all duration-300  "> */}
          {/* <SignInButton/> */}
        <Show when="signed-out">
        <Link
          href="/sign-in"
          className="min-w-21.5 rounded-full bg-surface ring-1 ring-gray-200 px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:bg-brand hover:text-white hover:shadow-md"
        >
          Sign In
        </Link>
        </Show>
        <Show when="signed-out">
        <Link
          href="/sign-up"
          className="min-w-23.25 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-brand-hover hover:shadow-md"
        >
          Sign Up
        </Link>
        </Show>

        {/* </button> */}
 
        <Show when="signed-in">
          <ProfileButton  />
        </Show>
      </div>
    </div>
    </div>
  );
}

export default Navbar
