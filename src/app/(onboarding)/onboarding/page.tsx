import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Google OAuth users are verified via provider, email signup users via email_confirmed_at
  const isEmailVerified =
    user.email_confirmed_at ||
    user.app_metadata?.provider === "google" ||
    user.app_metadata?.providers?.includes("google");

  if (!isEmailVerified) redirect("/confirm-email");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "freelancer") redirect("/dashboard");
  if (profile?.onboarding_complete) redirect("/jobs");

  return <OnboardingClient />;
}
