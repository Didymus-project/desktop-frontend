"use client";

import SidebarLink from "./SiderBarLink";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar() {
  const { user, loading, signOut } = useAuthStore();

  return (
    <aside className="w-64 flex-shrink-0 bg-[var(--background-secondary)] border-r border-border flex flex-col transition-colors duration-300">
      {/* Logo/Header Section */}
      <div className="h-16 flex items-center justify-center ">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Didymus</h1>
      </div>

      {/* Navigation Links - Conditional Rendering */}
      <nav className="flex-grow p-4">
        {/* Only render the links if the user is logged in and not loading */}
        {!loading && user && (
          <ul className="space-y-2">
            <SidebarLink href="/page1" text="Page 1" />
            <SidebarLink href="/page2" text="Page 2" />
            {/* Add more authenticated links here */}
          </ul>
        )}
        {/* You could add a message or placeholder here if the user is logged out */}
        {/* {!loading && !user && (
          <p className="text-sm text-center text-[var(--foreground-secondary)]">Please sign in</p>
        )} */}
      </nav>

      {/* Footer Section / User Info */}
      <div className={`p-4 ${user ? "border-t border-border" : ""}`}>
        {loading ? (
          <p className="text-sm text-[var(--foreground-secondary)]">
            Loading user...
          </p>
        ) : (
          user && (
            <>
              <p
                className="text-sm text-[var(--foreground-secondary)] truncate mb-2"
                title={user.email}
              >
                Signed in as: {user.email}
              </p>
              <button
                onClick={signOut}
                className="w-full px-3 py-1.5 text-sm rounded-md text-white bg-[var(--error)] hover:opacity-90 transition-opacity"
              >
                Sign Out
              </button>
            </>
          )
        )}
      </div>
    </aside>
  );
}
