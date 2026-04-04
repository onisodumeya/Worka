import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import FreelancerNav from "@/components/freelancer/FreelancerNav";
import "../globals.css";

export const metadata: Metadata = {
  title: "Worka — Nigerian Job Board",
  description: "Find the best jobs and talent in Nigeria",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, onboarding_complete, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <>
      {/* Only show nav for freelancers and public visitors */}

      <FreelancerNav profile={profile} user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  );
}
