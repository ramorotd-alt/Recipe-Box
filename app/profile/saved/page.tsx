import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SavedRecipeGrid } from "@/components/saved-recipe-grid";
import {
  loadAuthorsById,
  loadSavedRecipes,
  loadSocialCounts,
} from "@/lib/recipes";
import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved recipes - Recipe Box",
};

export default async function SavedRecipesPage() {
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

  const { recipes, error } = await loadSavedRecipes(supabase, user.id);
  const authorsById = await loadAuthorsById(
    supabase,
    recipes.map((recipe) => recipe.user_id),
  );
  const socialById = await loadSocialCounts(
    supabase,
    recipes.map((recipe) => recipe.id),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <p>
        <Link href="/profile" className="text-sm text-muted hover:text-foreground">
          Back to profile
        </Link>
      </p>
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Saved recipes
        </h1>
        <p className="text-muted">
          Recipes you liked, newest first.
        </p>
      </header>
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
          Could not load saved recipes. {error.message}
        </p>
      ) : (
        <SavedRecipeGrid
          recipes={recipes}
          authorsById={authorsById}
          socialById={socialById}
        />
      )}
    </main>
  );
}
