"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true); // Check if session is valid from link

  // Verify session on mount (Supabase handles this via hash)
  useEffect(() => {
    // Supabase client automatically picks up the session from the URL hash
    // We just check if a user session becomes available shortly after load
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Now we know the user followed the link and Supabase processed the recovery token
        setIsVerifying(false);
      } else if (!session) {
        // If there's no session after a short delay, the link might be invalid/expired
        setTimeout(() => {
          if (!supabase.auth.getSession()) {
            // Double check
            setError("Invalid or expired password reset link.");
            setIsVerifying(false);
          }
        }, 1000); // Give Supabase a moment
      } else {
        // Might already have a session, allow update
        setIsVerifying(false);
      }
    });

    // Initial check in case onAuthStateChange doesn't fire immediately for this case
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Start the timer check if no session initially
        setTimeout(() => {
          supabase.auth.getSession().then((res) => {
            if (!res.data.session) {
              setError("Invalid or expired password reset link.");
              setIsVerifying(false);
            } else {
              setIsVerifying(false); // Valid session found
            }
          });
        }, 1500);
      } else {
        setIsVerifying(false); // Already have a session
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      console.error("Error updating password:", error);
      setError(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000); // Delay redirect slightly so user can see message
    }

    setIsSubmitting(false);
  };

  if (isVerifying) {
    return <div className="text-center p-10">Verifying reset link...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background-secondary)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-md">
        <h1 className="text-2xl font-bold text-center text-[var(--foreground)]">
          Update Password
        </h1>

        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900 dark:text-red-100 dark:border-red-700">
            {error}
          </div>
        )}
        {/* Success/Info Message */}
        {message && (
          <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md dark:bg-green-900 dark:text-green-100 dark:border-green-700">
            {message}
          </div>
        )}

        {/* Only show form if the link seems valid (no error during verification) */}
        {!error && !message && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-[var(--foreground-secondary)]"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                placeholder="•••••••• (min. 6 characters)"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                Minimum 6 characters required.
              </p>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-[var(--foreground-secondary)]"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className={`w-full px-4 py-2 rounded-md text-white transition-colors ${
                isSubmitting
                  ? "bg-[var(--primary-disabled)] cursor-not-allowed"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {/* Show login link if there was an error or after success */}
        {(error || message) && (
          <p className="text-sm text-center text-[var(--foreground-secondary)]">
            Return to{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
