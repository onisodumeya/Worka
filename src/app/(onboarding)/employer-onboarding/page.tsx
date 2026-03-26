import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EmployerOnboardingClient from "./EmployerOnboardingClient";

export default async function EmployerOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isEmailVerified =
    user.email_confirmed_at ||
    user.app_metadata?.provider === "google" ||
    user.app_metadata?.providers?.includes("google");

  if (!isEmailVerified) redirect("/confirm-email");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, employer_onboarding_complete")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "employer") redirect("/jobs");
  if (profile?.employer_onboarding_complete) redirect("/dashboard");

  return <EmployerOnboardingClient />;
}
