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

  redirect(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
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
    redirect("/login");
  }

  const cookieStore = await cookies();
  cookieStore.set("insforge-token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/");
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

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("insforge-token");
  redirect("/login");
}
