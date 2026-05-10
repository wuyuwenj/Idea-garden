import { insforge } from "@/lib/insforge";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("redirect") || undefined;

  const callbackUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_APP_URL);
  if (redirectTo) {
    callbackUrl.searchParams.set("redirect", redirectTo);
  }

  const { data, error } = await insforge.auth.signInWithOAuth({
    provider: "github",
    redirectTo: callbackUrl.toString(),
    skipBrowserRedirect: true,
  });

  if (error || !data?.url) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to start GitHub login." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  if (data.codeVerifier) {
    cookieStore.set("insforge-pkce-verifier", data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
  }

  return NextResponse.redirect(data.url);
}
