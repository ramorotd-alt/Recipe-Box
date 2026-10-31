import { RecipeCard } from "@/components/recipe-card";
import { authorLabel, type RecipeSummary, type SocialCounts } from "@/lib/recipes";

export function SavedRecipeGrid({
  recipes,
  authorsById,
  socialById,
}: {
  recipes: RecipeSummary[];
  authorsById: Map<string, { full_name: string; username: string }>;
  socialById: Map<string, SocialCounts>;
}) {
  if (recipes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted">
        You have not liked a recipe yet. Like one and it will show up here.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard
            recipe={recipe}
            author={authorLabel(authorsById.get(recipe.user_id))}
            likeCount={socialById.get(recipe.id)?.likes ?? 0}
            commentCount={socialById.get(recipe.id)?.comments ?? 0}
          />
        </li>
      ))}
    </ul>
  );
}
