"use client"

import { useAuth } from "@clerk/nextjs"
import { ShieldX } from "lucide-react"

const Page = () => {
  const { signOut } = useAuth();
  
  return (
    <div className=' flex flex-col items-center justify-center h-screen'>
        <ShieldX className="mb-4 h-12 w-12 text-red-500" aria-hidden="true" />  
        <h1 className="text-2xl font-bold mb-4">You do not have an access!</h1>
        <button onClick={() => signOut()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sign Out
        </button>
    </div>
  )
}

export default Page
