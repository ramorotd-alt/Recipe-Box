import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Recipe } from "@/lib/supabase/database.types";

export const RECIPE_CATEGORIES = [
  "Breakfast",
  "Dinner",
  "Vegan",
  "Italian",
  "Dessert",
  "Quick",
] as const;

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type RecipeSummary = Pick<
  Recipe,
  | "id"
  | "user_id"
  | "title"
  | "description"
  | "cooking_time"
  | "difficulty"
  | "category"
  | "created_at"
>;

export async function loadAuthorsById(
  supabase: SupabaseClient<Database>,
  userIds: string[],
) {
  const authorsById = new Map<string, { full_name: string; username: string }>();
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return authorsById;
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .in("id", uniqueIds);

  for (const profile of profiles ?? []) {
    authorsById.set(profile.id, {
      full_name: profile.full_name,
      username: profile.username,
    });
  }

  return authorsById;
}

export function authorLabel(
  profile: { full_name: string; username: string } | undefined,
) {
  return profile?.full_name || profile?.username || "A cook";
}

export function recipeMatchesQuery(
  recipe: RecipeSummary,
  query: string,
  author: string,
) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  const haystack = [
    recipe.title,
    recipe.description,
    recipe.category,
    recipe.difficulty,
    author,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function dashboardHref({
  query,
  category,
  difficulty,
}: {
  query?: string;
  category?: string;
  difficulty?: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  const search = params.toString();
  return search ? `/dashboard?${search}` : "/dashboard";
}

export function recipeMatchesFilters(
  recipe: RecipeSummary,
  { category, difficulty }: { category?: string; difficulty?: string },
) {
  if (category && recipe.category !== category) {
    return false;
  }
  if (difficulty && recipe.difficulty !== difficulty) {
    return false;
  }
  return true;
}
