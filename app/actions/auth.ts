"use server";

import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthState = {
  error: string | null;
  message: string | null;
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function appOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) {
    return origin;
  }

  const host = (
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    ""
  )
    .split(",")[0]
    .trim();
  const proto = (
    headerStore.get("x-forwarded-proto") ?? "http"
  )
    .split(",")[0]
    .trim();

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = field(formData, "email");
  const password = field(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  if (data.user) {
    try {
      await ensureProfile(supabase, data.user);
    } catch (profileError) {
      return {
        error: profileErrorMessage(profileError),
        message: null,
      };
    }
  }

  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = field(formData, "fullName");
  const email = field(formData, "email");
  const password = field(formData, "password");
  const confirmPassword = field(formData, "confirmPassword");

  if (!fullName || !email || !password) {
    return { error: "Please fill in all fields.", message: null };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters.",
      message: null,
    };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", message: null };
  }

  const origin = await appOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  if (!data.session || !data.user) {
    return {
      error: null,
      message: "Check your email to confirm your account, then log in.",
    };
  }

  try {
    await ensureProfile(supabase, data.user);
  } catch (profileError) {
    return {
      error: profileErrorMessage(profileError),
      message: null,
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = field(formData, "email");

  if (!email) {
    return { error: "Email is required.", message: null };
  }

  const origin = await appOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  return {
    error: null,
    message: "If that email is registered, we sent a reset link.",
  };
}

export async function updatePassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = field(formData, "password");
  const confirmPassword = field(formData, "confirmPassword");

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters.",
      message: null,
    };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message, message: null };
  }

  redirect("/dashboard");
}
