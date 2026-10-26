import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile - Recipe Box",
};

export default async function ProfilePage() {
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
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
          {profileErrorMessage(error)}
        </p>
      </main>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, username, bio")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
          {profileErrorMessage(error)}
        </p>
      </main>
    );
  }

  const metadataBio =
    typeof user.user_metadata?.bio === "string"
      ? user.user_metadata.bio.trim()
      : "";
  let bio = profile?.bio ?? "";

  if (!bio && metadataBio) {
    const { error: copyError } = await supabase
      .from("profiles")
      .update({
        bio: metadataBio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!copyError) {
      bio = metadataBio;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-serif text-3xl tracking-tight">Your profile</h1>
        <p className="mt-2 mb-6 text-muted">
          Signup fills in a starting name. Update it here whenever you like.
        </p>
        <ProfileForm
          email={user.email ?? ""}
          fullName={profile?.full_name ?? ""}
          username={profile?.username ?? ""}
          bio={bio}
        />
      </section>
    </main>
  );
}
