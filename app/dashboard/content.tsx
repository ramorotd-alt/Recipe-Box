import Link from "next/link";
import { redirect } from "next/navigation";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeSearchForm } from "@/components/recipe-search-form";
import {
  authorLabel,
  loadAuthorsById,
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
  recipeMatchesFilters,
  recipeMatchesQuery,
  type RecipeSummary,
} from "@/lib/recipes";
import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export async function DashboardContent({
  query,
  categoryParam,
  difficultyParam,
}: {
  query: string;
  categoryParam: string;
  difficultyParam: string;
}) {
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
      <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
        {profileErrorMessage(error)}
      </p>
    );
  }

  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, user_id, title, description, cooking_time, difficulty, category, created_at",
    )
    .order("created_at", { ascending: false });

  const recipes = (data ?? []) as RecipeSummary[];
  const authorsById = await loadAuthorsById(
    supabase,
    recipes.map((recipe) => recipe.user_id),
  );
  const extraCategories = [
    ...new Set(
      recipes
        .map((recipe) => recipe.category)
        .filter(
          (name) =>
            name &&
            !RECIPE_CATEGORIES.includes(
              name as (typeof RECIPE_CATEGORIES)[number],
            ),
        ),
    ),
  ];
  const category =
    extraCategories.includes(categoryParam) ||
    RECIPE_CATEGORIES.includes(
      categoryParam as (typeof RECIPE_CATEGORIES)[number],
    )
      ? categoryParam
      : undefined;
  const difficulty = RECIPE_DIFFICULTIES.includes(
    difficultyParam as (typeof RECIPE_DIFFICULTIES)[number],
  )
    ? difficultyParam
    : undefined;
  const hasFilters = Boolean(query || category || difficulty);
  const visible = recipes.filter((recipe) => {
    const author = authorLabel(authorsById.get(recipe.user_id));
    return (
      recipeMatchesQuery(recipe, query, author) &&
      recipeMatchesFilters(recipe, { category, difficulty })
    );
  });
  const mine = visible.filter((recipe) => recipe.user_id === user.id);
  const community = visible.filter((recipe) => recipe.user_id !== user.id);

  return (
    <>
      <RecipeSearchForm
        query={query}
        category={category}
        difficulty={difficulty}
        extraCategories={extraCategories}
      />

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
                {hasFilters
                  ? "No recipes of yours match those filters."
                  : "You have not added a recipe yet."}
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
                {hasFilters
                  ? "No recipes from other cooks match those filters."
                  : "No recipes from other cooks yet."}
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
    </>
  );
}
