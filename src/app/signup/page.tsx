"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      // Options can be added here if needed, e.g., redirect URL
      // options: {
      //   emailRedirectTo: `${window.location.origin}/auth/callback`,
      // }
    });

    if (error) {
      console.error("Error signing up:", error);
      setError(error.message);
    } else if (data.user && data.user.identities?.length === 0) {
      // This condition might indicate email confirmation is required but the user already exists without being confirmed.
      // Supabase signUp might return a user object even if confirmation is needed.
      setMessage(
        "User already exists but is unconfirmed. Please check your email or try logging in."
      );
      setError(
        "Please check your email to confirm your account or try logging in if already confirmed."
      );
    } else if (data.session) {
      // User is automatically signed in (e.g., if email confirmation is disabled)
      setMessage("Signup successful! Redirecting...");
      // No need to redirect, AuthProvider handles it
    } else if (data.user) {
      // User created, but requires confirmation
      setMessage(
        "Signup successful! Please check your email to confirm your account."
      );
    } else {
      // Fallback for unexpected scenarios
      setMessage(
        "Signup process initiated. Please follow any instructions sent to your email."
      );
    }

    setIsSubmitting(false);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/page1");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="text-center p-10">Loading authentication state...</div>
    );
  }

  // Prevent rendering form if logged in
  if (user) {
    return (
      <div className="text-center p-10">Already logged in. Redirecting...</div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background-secondary)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-md">
        <h1 className="text-2xl font-bold text-center text-[var(--foreground)]">
          Create Account
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

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-[var(--foreground-secondary)]"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-[var(--foreground-secondary)]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Supabase default minimum
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
              placeholder="•••••••• (min. 6 characters)"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
              Minimum 6 characters required.
            </p>
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
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center text-[var(--foreground-secondary)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
