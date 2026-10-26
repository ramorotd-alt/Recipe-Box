import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export function profileErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    const message = String((error as { message: unknown }).message ?? "");
    const code =
      "code" in error && error.code ? String(error.code) : null;
    return [message, code].filter(Boolean).join(" ");
  }

  return "Could not set up your profile.";
}

export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  user: User,
) {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(profileErrorMessage(existingError));
  }

  if (existing) {
    return;
  }

  const emailName = user.email?.split("@")[0] ?? "user";
  const fullName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    emailName ||
    "Cook";
  const username =
    `${emailName.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user"}_${user.id.replaceAll("-", "").slice(0, 8)}`;
  const now = new Date().toISOString();

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    full_name: fullName,
    created_at: now,
    updated_at: now,
  });

  if (error && error.code !== "23505") {
    throw new Error(profileErrorMessage(error));
  }
}
