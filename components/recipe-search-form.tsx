import Link from "next/link";
import {
  dashboardHref,
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
} from "@/lib/recipes";

function chipClass(selected: boolean) {
  return selected
    ? "rounded-full border border-foreground bg-foreground px-3 py-1.5 text-sm text-background"
    : "rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted hover:border-foreground hover:text-foreground";
}

export function RecipeSearchForm({
  query,
  category,
  difficulty,
  extraCategories = [],
}: {
  query: string;
  category?: string;
  difficulty?: string;
  extraCategories?: string[];
}) {
  const categories = [
    ...RECIPE_CATEGORIES,
    ...extraCategories.filter(
      (name) =>
        !RECIPE_CATEGORIES.includes(
          name as (typeof RECIPE_CATEGORIES)[number],
        ),
    ),
  ];
  const hasFilters = Boolean(query || category || difficulty);

  return (
    <div className="flex flex-col gap-4">
      <form
        action="/dashboard"
        method="get"
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label htmlFor="q" className="sr-only">
          Search recipes
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search by title, category, or cook"
          className="h-12 w-full rounded-full border border-border bg-card px-5 text-base outline-none ring-accent focus:ring-2"
        />
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        {difficulty ? (
          <input type="hidden" name="difficulty" value={difficulty} />
        ) : null}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Search
          </button>
          {hasFilters ? (
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full px-4 text-sm text-muted hover:text-foreground"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Meal type</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={dashboardHref({ query, difficulty })}
            className={chipClass(!category)}
          >
            All
          </Link>
          {categories.map((name) => {
            const selected = category === name;
            return (
              <Link
                key={name}
                href={dashboardHref({
                  query,
                  category: selected ? undefined : name,
                  difficulty,
                })}
                className={chipClass(selected)}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Difficulty</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={dashboardHref({ query, category })}
            className={chipClass(!difficulty)}
          >
            All
          </Link>
          {RECIPE_DIFFICULTIES.map((name) => {
            const selected = difficulty === name;
            return (
              <Link
                key={name}
                href={dashboardHref({
                  query,
                  category,
                  difficulty: selected ? undefined : name,
                })}
                className={chipClass(selected)}
              >
                {name[0].toUpperCase() + name.slice(1)}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}