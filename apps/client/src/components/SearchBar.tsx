"use client";

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react"

const SearchBar = () => {
  const [value, setValue] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", value);
    router.push(`/products?${params.toString()}`, { scroll: false });
  }



  return (
    <div className='hidden md:flex items-center gap-2 rounded-full ring-1 ring-gray-100 px-2 py-2 shadow-sm bg-white'>
        <Search className="w-4 h-4 text-brand" />
        <input 
          id="search" 
          placeholder="Search..." 
          className="text-sm outline-0 w-32 md:w-64 lg:w-150 text-brand"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(value);
            }
          }}
        />
    </div>
  )
}

export default SearchBar