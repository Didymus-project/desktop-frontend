"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"enterEmail" | "enterCode">("enterEmail");

  const handleEmailRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    // This will send a 6-digit code to the user's email
    // using the "Magic Link" email template.
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // We don't want to create a new user if they don't exist
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send code. Please check the email and try again.");
    } else {
      setMessage("A 6-digit code has been sent to your email.");
      setStep("enterCode"); // Move to the next step
    }

    setIsSubmitting(false);
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    // 1. Verify the code
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: "email", // Specify 'email' as we used email OTP
      });

    if (verifyError || !verifyData.session) {
      console.error("Error verifying OTP:", verifyError);
      setError("Invalid or expired code. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // 2. If code is valid, user is briefly authenticated. Update their password.
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      setError("Failed to update password. Please try again.");
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      // Log the user out of this temporary session
      await supabase.auth.signOut();
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background-secondary)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-md">
        {/* Step 1: Enter Email */}
        {step === "enterEmail" && (
          <form onSubmit={handleEmailRequest} className="space-y-4">
            <h1 className="text-2xl font-bold text-center text-[var(--foreground)]">
              Reset Password
            </h1>
            <p className="text-sm text-center text-[var(--foreground-secondary)]">
              Enter your email address, and we&apos;ll send you a 6-digit code
              to reset your password.
            </p>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900 dark:text-red-100 dark:border-red-700">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md dark:bg-green-900 dark:text-green-100 dark:border-green-700">
                {message}
              </div>
            )}

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

            <button
              type="submit"
              className={`w-full px-4 py-2 rounded-md text-white transition-colors ${
                isSubmitting
                  ? "bg-[var(--primary-disabled)] cursor-not-allowed"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Code"}
            </button>
          </form>
        )}

        {/* Step 2: Enter Code and New Password */}
        {step === "enterCode" && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            <h1 className="text-2xl font-bold text-center text-[var(--foreground)]">
              Check Your Email
            </h1>
            <p className="text-sm text-center text-[var(--foreground-secondary)]">
              We sent a code to{" "}
              <span className="font-medium text-[var(--foreground)]">
                {email}
              </span>
              . Enter it below to reset your password.
            </p>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900 dark:text-red-100 dark:border-red-700">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md dark:bg-green-900 dark:text-green-100 dark:border-green-700">
                {message}
              </div>
            )}

            <div>
              <label
                htmlFor="code"
                className="block mb-2 text-sm font-medium text-[var(--foreground-secondary)]"
              >
                6-Digit Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                placeholder="123456"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block mb-2 text-sm font-medium text-[var(--foreground-secondary)]"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                placeholder="•••••••• (min. 6 characters)"
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
              {isSubmitting ? "Resetting..." : "Verify and Reset Password"}
            </button>
          </form>
        )}

        <p className="text-sm text-center text-[var(--foreground-secondary)]">
          Remember your password?{" "}
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
