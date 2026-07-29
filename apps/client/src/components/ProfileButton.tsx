"use client";

import { UserButton } from "@clerk/nextjs";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

const ProfileButton = (): JSX.Element => {
  const router = useRouter();

  return (
    <div className="flex shrink-0 items-center justify-center">
      <UserButton
        appearance={{
          elements: {
            avatarBox: {
              width: "40px",
              height: "40px",
            },
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
    </div>
  );
};

export default ProfileButton;