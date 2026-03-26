"use client";

import Link from "next/link";
import { useState, use } from "react";
import { toast } from "sonner";
import { signUp } from "@/lib/actions/auth";
import { getPasswordStrength } from "@/lib/utils/password";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import Button from "@/components/Button";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = use(searchParams);
  const [role, setRole] = useState<"freelancer" | "employer">("freelancer");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(false);

  const strengthInfo = getPasswordStrength(password);

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
    const result = await signUp(formData);
    if (result?.error) {
      toast.error(result.error);
      // setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create an account
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Join the Nigerian job board
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            name="full_name"
            type="text"
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Chidi Okeke"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            disabled={loading}
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            suppressHydrationWarning
            placeholder="Min. 6 characters"
          />

          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color}`}
                  style={{ width: strengthInfo.width }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 space-x-2">
                  {password.length < 8 && <span>· Min. 8 characters</span>}
                  {!/[A-Z]/.test(password) && <span>· Uppercase letter</span>}
                  {!/[0-9]/.test(password) && <span>· Number</span>}
                  {!/[^A-Za-z0-9]/.test(password) && (
                    <span>· Special character</span>
                  )}
                </p>
                <span
                  className={`text-xs font-medium ${
                    strengthInfo.strength === "weak"
                      ? "text-red-500"
                      : strengthInfo.strength === "fair"
                        ? "text-orange-500"
                        : strengthInfo.strength === "good"
                          ? "text-yellow-600"
                          : "text-green-600"
                  }`}
                >
                  {strengthInfo.label}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative flex cursor-pointer">
              <input
                type="radio"
                name="role"
                value="freelancer"
                checked={role === "freelancer"}
                onChange={() => setRole("freelancer")}
                disabled={loading}
                className="peer sr-only"
              />
              <div className="w-full p-3 border border-gray-200 rounded-lg text-sm text-center peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white transition-all">
                Freelancer
              </div>
            </label>
            <label className="relative flex cursor-pointer">
              <input
                type="radio"
                name="role"
                value="employer"
                checked={role === "employer"}
                onChange={() => setRole("employer")}
                disabled={loading}
                className="peer sr-only"
              />
              <div className="w-full p-3 border border-gray-200 rounded-lg text-sm text-center peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white transition-all">
                Employer
              </div>
            </label>
          </div>
        </div>

        {role === "employer" && (
          <div className="space-y-4 pt-2 pb-1 px-4 border border-gray-100 rounded-xl bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide pt-3">
              Organization details
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company name
              </label>
              <input
                name="company_name"
                type="text"
                required={role === "employer"}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Acme Technologies Ltd."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                name="industry"
                required={role === "employer"}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select industry</option>
                <option value="fintech">Fintech</option>
                <option value="ecommerce">E-commerce</option>
                <option value="healthtech">Healthtech</option>
                <option value="edtech">Edtech</option>
                <option value="logistics">Logistics</option>
                <option value="media">Media & Entertainment</option>
                <option value="consulting">Consulting</option>
                <option value="government">Government</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="pb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company size
              </label>
              <select
                name="company_size"
                required={role === "employer"}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select size</option>
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201-500">201–500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 cursor-pointer"
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-500 leading-relaxed"
          >
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              className="text-gray-900 font-medium hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              className="text-gray-900 font-medium hover:underline"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          disabled={!terms}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="w-full flex items-center gap-2 mt-3">
        <div className="h-px bg-gray-200 w-full"></div>
        <span className="text-gray-300">OR</span>
        <div className="h-px bg-gray-200 w-full"></div>
      </div>

      <Button
        click={handleGoogleSignIn}
        className="w-full"
        variant="outline"
        disabled={!terms}
      >
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
