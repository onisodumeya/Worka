"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast, Toaster } from "sonner";
import { Mail } from "lucide-react";

export default function ConfirmEmailClient() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      toast.error("Could not find your email. Please sign up again.");
      setResending(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setResent(true);
      toast.success("Confirmation email resent!");
    }

    setResending(false);
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Check your inbox
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          We sent you a confirmation link. Click it to activate your account and
          get started.
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Can't find it? Check your spam folder. The link expires in{" "}
          <span className="font-medium text-gray-700">24 hours</span>.
        </p>
      </div>

      <button
        onClick={handleResend}
        disabled={resending || resent}
        className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resending
          ? "Resending..."
          : resent
            ? "Email resent!"
            : "Resend confirmation email"}
      </button>

      <p className="mt-4 text-center text-xs text-gray-400">
        Wrong email?{" "}
        <a href="/signup" className="text-gray-600 font-medium hover:underline">
          Sign up again
        </a>
      </p>
    </>
  );
}
