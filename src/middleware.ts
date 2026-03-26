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

  // Auth pages — redirect logged-in users away
  const authPages = ["/login", "/signup"];
  if (user) {
    const alwaysAllowed = ["/select-role", "/confirm-email", "/auth/error"];

    if (alwaysAllowed.some((p) => pathname.startsWith(p))) {
      return supabaseResponse;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Only enforce role
    if (!profile?.role) {
      return NextResponse.redirect(new URL("/select-role", request.url));
    }

    // Role-based routing only
    if (profile.role === "freelancer" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/jobs", request.url));
    }

    if (profile.role === "employer" && pathname.startsWith("/jobs")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protected routes — redirect logged-out users to login
  const protectedPaths = ["/dashboard", "/confirm-email"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Employer dashboard — redirect incomplete onboarding
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, employer_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (profile?.role === "freelancer") {
      return NextResponse.redirect(new URL("/jobs", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
