import SidebarLink from "./SiderBarLink";

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-[var(--background-secondary)] border-r border-border flex flex-col transition-colors duration-300">
      {/* Logo/Header Section */}
      <div className="h-16 flex items-center justify-center ">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Didymus</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {/* Add links to your routes here */}
          <SidebarLink href="/page1" text="Page 1" />
          <SidebarLink href="/page2" text="Page 2" />
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="p-4 ">
        <p className="text-sm text-[var(--foreground-secondary)]">
          *insert Footer content
        </p>
      </div>
    </aside>
  );
}
