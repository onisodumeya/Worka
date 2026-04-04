import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Pages always accessible to authenticated users regardless of state
  const alwaysAllowed = ["/auth/error", "/auth/callback"];
  if (alwaysAllowed.some((p) => pathname.startsWith(p))) {
    return supabaseResponse;
  }

  // Auth pages — redirect logged-in users away
  const authPages = ["/login", "/signup"];
  if (user && authPages.includes(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_complete, employer_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (!profile?.role) {
      return NextResponse.redirect(new URL("/select-role", request.url));
    }

    if (profile.role === "employer") {
      return NextResponse.redirect(
        new URL(
          profile.employer_onboarding_complete
            ? "/dashboard"
            : "/employer-onboarding",
          request.url,
        ),
      );
    }

    return NextResponse.redirect(
      new URL(profile?.onboarding_complete ? "/" : "/onboarding", request.url),
    );
  }

  // Select-role — unauthenticated users go to login
  if (!user && pathname === "/select-role") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Select-role — users with a role get redirected away
  if (user && pathname === "/select-role") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_complete, employer_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (profile?.role === "employer") {
      return NextResponse.redirect(
        new URL(
          profile.employer_onboarding_complete
            ? "/dashboard"
            : "/employer-onboarding",
          request.url,
        ),
      );
    }

    if (profile?.role === "freelancer") {
      return NextResponse.redirect(
        new URL(profile.onboarding_complete ? "/" : "/onboarding", request.url),
      );
    }

    // No role yet — allow through
    return supabaseResponse;
  }

  // Protected routes — redirect logged-out users to login
  const protectedPaths = [
    "/dashboard",
    "/onboarding",
    "/employer-onboarding",
    "/confirm-email",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Freelancers can't access employer dashboard
    if (profile?.role === "freelancer" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Employers can't access freelancer jobs page
    if (profile?.role === "employer" && pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
