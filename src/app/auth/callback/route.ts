import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/jobs";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_complete, employer_onboarding_complete")
          .eq("id", user.id)
          .single();

        const isGoogleUser =
          user.app_metadata?.provider === "google" ||
          user.app_metadata?.providers?.includes("google");

        function redirectTo(pathname: string) {
          const url = request.nextUrl.clone();
          url.pathname = pathname;
          return NextResponse.redirect(url);
        }

        // New Google user — create profile immediately
        if (!profile && isGoogleUser) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email!,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email!.split("@")[0],
            avatar_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              null,
            role: null,
            onboarding_complete: false,
            employer_onboarding_complete: false,
          });

          return redirectTo("/select-role");
        }

        // No profile or no role
        if (!profile || !profile.role) {
          return redirectTo("/select-role");
        }

        // Returning employer
        if (profile.role === "employer") {
          return redirectTo(
            profile.employer_onboarding_complete
              ? "/dashboard"
              : "/employer-onboarding",
          );
        }

        // Returning freelancer
        return redirectTo(
          profile.onboarding_complete ? "/jobs" : "/onboarding",
        );
      }
    }
  }

  // Email confirmation flow
  const url = request.nextUrl.clone();
  url.pathname = next;
  return NextResponse.redirect(url);
}
