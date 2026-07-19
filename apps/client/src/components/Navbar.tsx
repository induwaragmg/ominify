import Image from "next/image"
import Link from "next/link"
import SearchBar from "./SearchBar";
import { Bell, Home, ShoppingCart } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import ProfileButton from "./ProfileButton";

const Navbar = () => {
  return (
    <div className="mx-auto px-4 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
    <div className="w-full flex items-center justify-between  border-gray-200 py-4">
      {/* Left */}
     
      <Link href="/" className="flex items-center h-12">
        <Image
          src="/logo.svg"
          alt="Ominify"
          width={300}
          height={60}
          className="h-full w-auto"
        />
      </Link>
      {/* Right */}
        <SearchBar />
      <div className="flex items-center gap-4">
        <Link href="/">
          <Home className="w-4 h-4 text-white" />
        </Link>
        <Bell className="w-4 h-4 text-white" />
        <ShoppingCartIcon />
        <button className="text-white hover:cursor-pointer bg-accent  rounded-full px-3 py-1 text-md hover:text-white hover:bg-accent-light transition-all duration-300  ">
        <Show when="signed-out">
          <SignInButton/>
        </Show>
        </button>
 
        <Show when="signed-in">
          <ProfileButton />
        </Show>
      </div>
    </div>
    </div>
  );
}

export default Navbar