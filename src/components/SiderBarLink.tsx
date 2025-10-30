"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  text: string;
}

export default function SidebarLink({ href, text }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li className="list-none">
      <Link
        href={href}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
          isActive
            ? "bg-[var(--primary)] text-white"
            : "text-[var(--foreground-secondary)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
        }`}
      >
        <span className="font-medium">{text}</span>
      </Link>
    </li>
  );
}
