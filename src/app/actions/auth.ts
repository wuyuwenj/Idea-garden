"use server";

import { insforge } from "@/lib/insforge";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as z from "zod";

const SignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type AuthState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await insforge.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
  });

  if (error) {
    return { message: error.message };
  }

  // Store session token
  const cookieStore = await cookies();
  if (data?.accessToken) {
    cookieStore.set("insforge-token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }

  const redirectTo = formData.get("redirect") as string;
  const verifyUrl = `/verify?email=${encodeURIComponent(parsed.data.email)}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ""}`;
  redirect(verifyUrl);
}

export async function resendVerification(email: string) {
  const { error } = await insforge.auth.resendVerificationEmail({ email });
  if (error) {
    return { message: error.message };
  }
  return { success: true };
}

export async function verifyEmail(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp || otp.length !== 6) {
    return { message: "Please enter the 6-digit code from your email." };
  }

  const { error } = await insforge.auth.verifyEmail({ email, otp });

  if (error) {
    return { message: error.message };
  }

  // Auto-login after verification
  const { data, error: loginError } = await insforge.auth.signInWithPassword({
    email,
    password: formData.get("password") as string,
  });

  if (loginError || !data?.accessToken) {
    // Verification succeeded, but auto-login failed — send to login page
    const redirectTo = formData.get("redirect") as string;
    redirect(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login");
  }

  const cookieStore = await cookies();
  cookieStore.set("insforge-token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  const redirectTo = formData.get("redirect") as string;
  redirect(redirectTo || "/");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await insforge.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { message: error.message };
  }

  const cookieStore = await cookies();
  if (data?.accessToken) {
    cookieStore.set("insforge-token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  const redirectTo = formData.get("redirect") as string;
  redirect(redirectTo || "/");
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("insforge-token")?.value;
  if (!token) return false;

  insforge.setAccessToken(token);
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) {
    // Token is invalid/expired — clear it
    cookieStore.delete("insforge-token");
    return false;
  }
  return true;
}

export async function signInWithGitHub(redirectTo?: string) {
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
    return { message: error?.message ?? "Failed to start GitHub login." };
  }

  // Store PKCE verifier in cookie for the callback
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

  return { url: data.url };
}

export async function exchangeOAuthCodeAction(code: string): Promise<AuthState> {
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("insforge-pkce-verifier")?.value;
  cookieStore.delete("insforge-pkce-verifier");

  const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.accessToken) {
    return { message: error?.message ?? "Failed to complete GitHub login." };
  }

  cookieStore.set("insforge-token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return undefined;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("insforge-token");
  redirect("/login");
}
