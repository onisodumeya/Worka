"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import Button from "@/components/Button";

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn(formData);
    if (result?.error) {
      toast.error(result.error);
      setShowForgotPassword(true);
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!resetEmail) return;
    setResetting(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetSent(true);
    setResetting(false);
    toast.success("Reset link sent! Check your inbox.");
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Log in to your account</p>
      </div>

      {showForgotPassword && (
        <div className="mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
          {resetSent ? (
            <p className="text-sm text-blue-700">
              Reset link sent! Check your inbox and follow the instructions.
            </p>
          ) : (
            <>
              <p className="text-sm text-blue-700 mb-3">
                Forgot your password? Enter your email and we'll send you a
                reset link.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  suppressHydrationWarning
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={resetting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {resetting ? "Sending..." : "Send link"}
                </button>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="mt-2 text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            disabled={loading}
            suppressHydrationWarning
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <PasswordInput
            name="password"
            required
            disabled={loading}
            suppressHydrationWarning
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="w-full flex items-center gap-2 my-3">
        <div className="h-px bg-gray-200 w-full"></div>
        <span className="text-gray-300">OR</span>
        <div className="h-px bg-gray-200 w-full"></div>
      </div>

      <Button click={handleGoogleSignIn} className="w-full" variant="outline">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
