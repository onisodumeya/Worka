"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPasswordStrength } from "@/lib/utils/password";
import PasswordInput from "@/components/PasswordInput";
import Button from "@/components/Button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strengthInfo = getPasswordStrength(password);

  async function handleSubmit() {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your reset link has expired. Please request a new one.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Set new password
        </h1>
        <p className="text-sm text-gray-500 mt-1">Choose a strong password</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            placeholder="Min. 6 characters"
          />

          {/* Strength indicator */}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
          />
        </div>

        <Button click={handleSubmit} loading={loading} className="w-full">
          {loading ? "Updating..." : "Update password"}
        </Button>
      </div>
    </>
  );
}
