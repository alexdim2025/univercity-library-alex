'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { getInitials } from "@/lib/utils";

const Header = ({ session}: { session: Session }) => {
const pathname = usePathname();

  return (
     <header className="my-10 flex justify-between gap-5">
         <Link href="/">
            <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
        </Link>
        
        <ul className="flex flex-row items-center gap-8">
           <li>
              <Link
                 href="/library"
                 className={ cn("text-base cursor-pointer capitalize", pathname === "/library" ? "text-light-200" : "text-light-100")}
              >Library</Link>
           </li>
           <li>
              <Link href="/my-profile">
                  <Avatar>
                    <AvatarFallback className="bg-amber-100">
                       {getInitials(session?.user?.name || "AD")}
                    </AvatarFallback>
                  </Avatar>
              </Link>
           </li>
        </ul>
      </header>
  )
}

export default Header