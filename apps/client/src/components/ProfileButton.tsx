// "use client"

// import { UserButton } from "@clerk/nextjs"
// import { ShoppingBag } from "lucide-react"
// import { useRouter } from "next/dist/client/components/navigation"

// const ProfileButton = () => {
//   const router = useRouter();
//   return (
//     <UserButton>
//         <UserButton.MenuItems>
//             <UserButton.Action 
//                 label="See Orders"
//                 labelIcon={<ShoppingBag className="w-4 h-4" />}
//                 onClick={() => router.push("/orders")}
//             />
//         </UserButton.MenuItems>
//     </UserButton>
//   )
// }
// export default ProfileButton

"use client";

import { UserButton } from "@clerk/nextjs";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

const ProfileButton = () => {
  const router = useRouter();

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: {
            width: "38px",
            height: "38px",
          }
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Action
          label="See Orders"
          labelIcon={<ShoppingBag className="w-4 h-4" />}
          onClick={() => router.push("/orders")}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default ProfileButton;