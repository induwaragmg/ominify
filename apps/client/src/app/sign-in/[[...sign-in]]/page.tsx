import { SignIn } from "@clerk/nextjs";
import { ominifyClerkAppearance } from "@/lib/clerkTheme";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans bg-[#f8f9fb]">
      {/* 1. Blurred Storefront Background (Matches 895px Home Carousel Width) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 flex flex-col items-center justify-center p-4 pointer-events-none select-none filter blur-md opacity-60"
      >
        <div className="w-full max-w-[895px] space-y-4">
          <div className="relative w-full h-[320px] sm:h-[360px] lg:h-[390px] rounded-3xl overflow-hidden shadow-md">
            <Image
              src="/banners/banner1.png"
              alt="Home Storefront"
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* 2. Glassmorphism Blur Backdrop */}
      <div className="fixed inset-0 z-10 bg-slate-950/20 backdrop-blur-xl" />

      {/* 3. Floating Close Button */}
      <Link
        href="/"
        className="fixed top-5 right-5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105"
        title="Return to store"
      >
        <X className="h-5 w-5" />
      </Link>

      {/* 4. Centered Auth Card */}
      <div className="relative z-20 w-full flex justify-center p-4">
        <SignIn
          appearance={ominifyClerkAppearance}
          localization={{
            signIn: {
              start: {
                title: "Sign in to Ominify",
                subtitle: "Welcome back! Please sign in to continue to Ominify",
              },
            },
          }}
        />
      </div>
    </div>
  );
}