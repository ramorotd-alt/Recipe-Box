import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RecipeCard } from "@/components/recipe-card";
import { authorLabel, loadAuthorsById, type RecipeSummary } from "@/lib/recipes";
import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard - Recipe Box",
};

export default async function DashboardPage() {
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
    const message = profileErrorMessage(error);
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
          {message}
        </p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, user_id, title, description, cooking_time, difficulty, category, created_at",
    )
    .order("created_at", { ascending: false });

  const recipes = (data ?? []) as RecipeSummary[];
  const mine = recipes.filter((recipe) => recipe.user_id === user.id);
  const community = recipes.filter((recipe) => recipe.user_id !== user.id);
  const authorsById = await loadAuthorsById(
    supabase,
    recipes.map((recipe) => recipe.user_id),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Your kitchen
          </h1>
          <p className="mt-2 text-muted">
            Your recipes, plus dishes from other cooks.
          </p>
        </div>
        <Link
          href="/recipes/new"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Add recipe
        </Link>
      </section>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
          Could not load recipes. {error.message}
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-2xl">Your recipes</h2>
            {mine.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted">
                You have not added a recipe yet.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mine.map((recipe) => (
                  <li key={recipe.id}>
                    <RecipeCard
                      recipe={recipe}
                      author={authorLabel(authorsById.get(recipe.user_id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-2xl">From other cooks</h2>
            {community.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted">
                No recipes from other cooks yet.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {community.map((recipe) => (
                  <li key={recipe.id}>
                    <RecipeCard
                      recipe={recipe}
                      author={authorLabel(authorsById.get(recipe.user_id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
