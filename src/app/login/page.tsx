"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation"; // Use App Router's useRouter
import Link from "next/link"; // Import Link for navigation

export default function LoginPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    // --- THIS IS THE FIX ---
    // Add the 'options' object with 'queryParams' to force the account selector
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    // --- END FIX ---

    if (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
      setIsSubmitting(false); // Make sure to stop submitting on error
    }
    // On success, the AuthProvider will detect the new session and redirect.
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error signing in with email:", error);
      setError(error.message);
    } else {
      setMessage("Successfully signed in. Redirecting...");
      // No need to redirect here, the AuthProvider's listener will handle it
    }
    setIsSubmitting(false);
  };

  // Redirect if already logged in and not loading
  useEffect(() => {
    if (!loading && user) {
      router.push("/page1"); // Redirect to a default page after login
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="text-center p-10">Loading authentication state...</div>
    ); // Show loading indicator
  }

  // Prevent rendering the form if the user object exists (even briefly before redirect)
  if (user) {
    return (
      <div className="text-center p-10">Already logged in. Redirecting...</div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background-secondary)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-md">
        <h1 className="text-2xl font-bold text-center text-[var(--foreground)]">
          Login to Didymus
        </h1>

        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900 dark:text-red-100 dark:border-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm text-blue-700 bg-blue-100 border border-blue-300 rounded-md dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700">
            {message}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
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
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-sm text-right">
          <Link
            href="/forgot-password"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative px-2 bg-[var(--card)] text-sm text-[var(--foreground-secondary)]">
            OR
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
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
          {isSubmitting ? "Processing..." : "Sign in with Google"}
        </button>

        {/* Link to Sign Up */}
        <p className="text-sm text-center text-[var(--foreground-secondary)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
