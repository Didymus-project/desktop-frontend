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

  // --- ADDED GOOGLE SIGN UP HANDLER ---
  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          prompt: "select_account", // Force account selection
        },
      },
    });

    if (error) {
      console.error("Error signing up with Google:", error);
      setError(error.message);
      setIsSubmitting(false);
    }
    // On success, AuthProvider will handle the redirect
  };
  // --- END ADDED HANDLER ---

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

        {/* --- ADDED DIVIDER AND GOOGLE BUTTON --- */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative px-2 bg-[var(--card)] text-sm text-[var(--foreground-secondary)]">
            OR
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={isSubmitting}
          className={`w-full px-4 py-2 rounded-md border transition-colors flex items-center justify-center gap-2 ${
            isSubmitting
              ? "border-[var(--border)] text-[var(--foreground-secondary)] bg-[var(--background-secondary)] cursor-not-allowed"
              : "border-[var(--border)] text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--background-secondary)]"
          }`}
        >
          {/* Basic Google Icon SVG */}
          <svg
            className="w-5 h-5"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.091,44,20C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          {isSubmitting ? "Processing..." : "Sign up with Google"}
        </button>
        {/* --- END OF ADDED SECTION --- */}

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
