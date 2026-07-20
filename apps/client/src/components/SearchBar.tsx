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
    <div className='hidden md:flex flex-1 items-center gap-2 rounded-full ring-1 ring-gray-100 pl-2  shadow-sm bg-white'>
        <input 
          id="search" 
          placeholder="Search..." 
          className="text-md outline-0 pl-2 w-full min-w-0 text-gray-600 my-2"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(value);
            }
          }}
        />
        <div className="cursor-pointer bg-brand rounded-full w-12 h-full py-2 px-1 mr-1 flex items-center justify-center" onClick={() => handleSearch(value)}>
        <Search className="w-4.5 h-4.5 text-white" />
        </div>
    </div>
  )
}

export default SearchBar