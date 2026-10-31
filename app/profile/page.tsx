import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { RecipeCard } from "@/components/recipe-card";
import { SavedRecipeGrid } from "@/components/saved-recipe-grid";
import {
  authorLabel,
  loadAuthorsById,
  loadSavedRecipes,
  loadSocialCounts,
  type RecipeSummary,
} from "@/lib/recipes";
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

  const { data: recipeRows, error: recipesError } = await supabase
    .from("recipes")
    .select(
      "id, user_id, title, description, cooking_time, difficulty, category, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const recipes = (recipeRows ?? []) as RecipeSummary[];
  const author = authorLabel(profile ?? undefined);
  const { recipes: savedRecipes, error: savedError } = await loadSavedRecipes(
    supabase,
    user.id,
  );
  const socialById = await loadSocialCounts(supabase, [
    ...recipes.map((recipe) => recipe.id),
    ...savedRecipes.map((recipe) => recipe.id),
  ]);
  const savedAuthorsById = await loadAuthorsById(
    supabase,
    savedRecipes.map((recipe) => recipe.user_id),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8 sm:mx-0">
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

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-2xl">Your recipes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/profile/saved"
              className="text-sm text-muted hover:text-foreground"
            >
              Saved recipes
            </Link>
            <Link
              href="/recipes/new"
              className="text-sm text-muted hover:text-foreground"
            >
              Add recipe
            </Link>
          </div>
        </div>
        {recipesError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
            Could not load recipes. {recipesError.message}
          </p>
        ) : recipes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted">
            You have not added a recipe yet.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  author={author}
                  likeCount={socialById.get(recipe.id)?.likes ?? 0}
                  commentCount={socialById.get(recipe.id)?.comments ?? 0}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-2xl">Saved recipes</h2>
          <Link
            href="/profile/saved"
            className="text-sm text-muted hover:text-foreground"
          >
            View saved page
          </Link>
        </div>
        {savedError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
            Could not load saved recipes. {savedError.message}
          </p>
        ) : (
          <SavedRecipeGrid
            recipes={savedRecipes}
            authorsById={savedAuthorsById}
            socialById={socialById}
          />
        )}
      </section>
    </main>
  );
}