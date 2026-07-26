import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <div className="w-full">
      {/* <div className="mt-16 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between md:gap-0  p-8 "> */}
      <div className="mt-16 grid flex-1 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8 p-8">
        <div className="flex flex-col gap-4 items-center md:items-start">
          {/* <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Ominify" width={36} height={36} />
            <p className="hidden md:block text-md font-medium tracking-wider text-white">
              OMINIFY.
            </p>
          </Link> */}
          <Link href="/" className="flex items-center h-12">
            <Image
              src="/logo.svg"
              alt="Ominify"
              width={300}
              height={60}
              className="h-full w-auto"
            />
          </Link>
          <p className="text-sm text-gray-400">© 2026 Ominify.</p>
          <p className="text-sm text-gray-400">All rights reserved.</p>
        </div>
        {/* <div className="mx-auto sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl flex flex-col items-center md:gap-8 md:flex-row md:items-start md:justify-between "> */}

        <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
          {/* <p className="text-sm text-gray-400">Links</p> */}
          <Link href="/">Homepage</Link>
          <Link href="/">Contact</Link>
          <Link href="/">Terms of Service</Link>
          <Link href="/">Privacy Policy</Link>
        </div>

        <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
          {/* <p className="text-sm text-gray-400">Links</p> */}
          <Link href="/">All Products</Link>
          <Link href="/">New Arrivals</Link>
          <Link href="/">Best Sellers</Link>
          <Link href="/">Sale</Link>
        </div>

        <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
          {/* <p className="text-sm text-gray-400">Links</p> */}
          <Link href="/">About</Link>
          <Link href="/">Contact</Link>
          <Link href="/">Blog</Link>
          <Link href="/">Affiliate Program</Link>
        </div>
 
       
        <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
          <Link href="/">Help Center</Link>
          <Link href="/">Track Order</Link>
          <Link href="/">Shipping Information</Link>
          <Link href="/">Returns & Refunds</Link>
        </div>

        <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
          <Link href="/">Careers</Link>
          <Link href="/">Press</Link>
          <Link href="/">Our Story</Link>
          <Link href="/">Partners</Link>
        </div>

      
      </div>
    </div>
  )
}

export default Footer