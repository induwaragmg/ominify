import Image from "next/image"
import Link from "next/link"
import SearchBar from "./SearchBar";
import { Bell, Home, ShoppingCart } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import ProfileButton from "./ProfileButton";

const Navbar = () => {
  return (
    <div className="w-full flex items-center justify-between border-b border-gray-200 py-4">
      {/* Left */}
      <Link href="/" className="flex items-center">
        <Image
          src={"/logo.png"}
          alt="logo"
          width={36}
          height={36}
          className="w-6 h-6 md:h-9 md:w-9"
        />
        <p className="hidden md:block md:text-md md:text-xl lg:text-2xl font-medium tracking-wider">
          trendlama.
        </p>
      </Link>
      {/* Right */}
      <div className="flex items-center gap-4">
        <SearchBar />
        <Link href="/">
          <Home className="w-4 h-4 text-gray-600" />
        </Link>
        <Bell className="w-4 h-4 text-gray-600" />
        <ShoppingCartIcon />
        <Show when="signed-out">
          <SignInButton />
        </Show>
        <Show when="signed-in">
          <ProfileButton />
        </Show>
      </div>
    </div>
  );
}

export default Navbar