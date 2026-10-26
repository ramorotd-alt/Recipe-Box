"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = {
  error: string | null;
  message: string | null;
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await ensureProfile(supabase, user);
  } catch (error) {
    return { error: profileErrorMessage(error), message: null };
  }

  const fullName = field(formData, "fullName");
  const username = field(formData, "username").toLowerCase();
  const bio = field(formData, "bio");

  if (!fullName) {
    return { error: "Full name is required.", message: null };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Username must be 3-32 characters using lowercase letters, numbers, or underscores.",
      message: null,
    };
  }

  if (bio.length > 280) {
    return { error: "Bio must be 280 characters or fewer.", message: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      username,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken.", message: null };
    }

    return { error: profileErrorMessage(error), message: null };
  }

  await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");

  return { error: null, message: "Profile saved." };
}
