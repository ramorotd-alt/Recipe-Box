import Link from "next/link";

export type RecipeCardData = {
  id: string;
  title: string;
  description: string | null;
  cooking_time: number | null;
  difficulty: string | null;
  category: string;
};

const CARD_COLORS = [
  "#c45c26",
  "#b42318",
  "#7c3aed",
  "#b45309",
  "#0f766e",
  "#c2410c",
];

function cardColor(id: string) {
  const index =
    Math.abs(id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) %
    CARD_COLORS.length;
  return CARD_COLORS[index];
}

export function RecipeCard({
  recipe,
  author,
}: {
  recipe: RecipeCardData;
  author: string;
}) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="h-36"
          style={{ backgroundColor: cardColor(recipe.id) }}
          aria-hidden="true"
        />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <span className="w-fit rounded-full bg-background px-2 py-0.5 text-xs text-muted">
            {recipe.category}
          </span>
          <h2 className="font-serif text-xl leading-snug">{recipe.title}</h2>
          {recipe.description ? (
            <p className="line-clamp-2 flex-1 text-sm text-muted">
              {recipe.description}
            </p>
          ) : (
            <p className="flex-1" />
          )}
          <p className="text-sm text-muted">
            {[
              recipe.cooking_time != null ? `${recipe.cooking_time} min` : null,
              recipe.difficulty,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="text-sm">By {author}</p>
        </div>
      </article>
    </Link>
  );
}
