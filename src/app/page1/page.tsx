"use client";

import useTheme from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page1() {
  const { theme } = useTheme();
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Optionally show a loading state while checking auth
  if (loading || !user) {
    return <div>Loading or redirecting...</div>;
  }

  // Original page content if user is authenticated
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
          Protected Page 1 - Theme Demo
        </h1>
        <p className="text-lg text-[var(--foreground-secondary)] mb-8">
          You are logged in! Current theme is:
          <span className="font-bold text-[var(--primary)] ml-2 capitalize">
            {theme}
          </span>
        </p>
      </div>

      {/* Grid for showcasing different components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Card Component Example */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-md transition-colors duration-300">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
            Card Element
          </h2>
          <p className="text-[var(--foreground-secondary)] mb-4">
            To use the theme variables, use Tailwind&apos;s arbitrary value
            syntax. For example, the background of this card is set with
            `bg-[var(--card)]`.
          </p>
          <div className="h-20 bg-[var(--background-secondary)] rounded-md flex items-center justify-center transition-colors duration-300">
            <p className="text-sm font-medium text-[var(--foreground-secondary)]">
              A nested element with bg-[var(--background-secondary)]
            </p>
          </div>
        </div>

        {/* Buttons Example */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-md transition-colors duration-300">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
            Button States
          </h2>
          <p className="text-[var(--foreground-secondary)] mb-4">
            These buttons use theme variables for different states, which update
            automatically when the theme is changed.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 rounded-md text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors">
              Primary
            </button>
            <button className="px-4 py-2 rounded-md text-white bg-[var(--success)] transition-colors">
              Success
            </button>
            <button className="px-4 py-2 rounded-md text-white bg-[var(--error)] transition-colors">
              Error
            </button>
            <button className="px-4 py-2 rounded-md text-black bg-[var(--warning)] transition-colors">
              Warning
            </button>
            <button className="px-4 py-2 rounded-md text-white bg-[var(--primary-disabled)] cursor-not-allowed">
              Disabled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
