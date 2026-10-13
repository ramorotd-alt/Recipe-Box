type Difficulty = "easy" | "medium" | "hard";

type Recipe = {
  id: string;
  title: string;
  description: string;
  author: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  categories: string[];
  accent: string;
};

const CATEGORIES = [
  "Breakfast",
  "Dinner",
  "Vegan",
  "Italian",
  "Dessert",
  "Quick",
] as const;

const RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Lemon herb roast chicken",
    description: "Weeknight roast with garlic, thyme, and a bright pan sauce.",
    author: "Maya Chen",
    prepTimeMinutes: 15,
    cookTimeMinutes: 55,
    servings: 4,
    difficulty: "easy",
    categories: ["Dinner"],
    accent: "#c45c26",
  },
  {
    id: "2",
    title: "Tomato basil pasta",
    description: "A handful of ingredients, ripe tomatoes, and a lot of basil.",
    author: "Luca Rossi",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    difficulty: "easy",
    categories: ["Dinner", "Italian", "Quick"],
    accent: "#b42318",
  },
  {
    id: "3",
    title: "Overnight oats with berries",
    description: "Stir it at night, eat it in the morning. No cooking required.",
    author: "Priya Nair",
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: "easy",
    categories: ["Breakfast", "Vegan", "Quick"],
    accent: "#7c3aed",
  },
  {
    id: "4",
    title: "Chickpea coconut curry",
    description: "Creamy, spiced, and ready in one pot with pantry staples.",
    author: "Jordan Hale",
    prepTimeMinutes: 12,
    cookTimeMinutes: 30,
    servings: 4,
    difficulty: "medium",
    categories: ["Dinner", "Vegan"],
    accent: "#b45309",
  },
  {
    id: "5",
    title: "Olive oil cake",
    description: "Tender crumb, citrus zest, and a dusting of powdered sugar.",
    author: "Elena Park",
    prepTimeMinutes: 20,
    cookTimeMinutes: 40,
    servings: 8,
    difficulty: "medium",
    categories: ["Dessert", "Italian"],
    accent: "#0f766e",
  },
  {
    id: "6",
    title: "Shakshuka",
    description: "Eggs poached in a pepper-tomato sauce. Serve with bread.",
    author: "Noor Alami",
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 3,
    difficulty: "easy",
    categories: ["Breakfast", "Dinner"],
    accent: "#c2410c",
  },
];

function queryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

function filterRecipes(
  recipes: Recipe[],
  query?: string,
  category?: string,
): Recipe[] {
  const needle = query?.toLowerCase();

  return recipes.filter((recipe) => {
    const matchesCategory = category
      ? recipe.categories.includes(category)
      : true;
    const matchesQuery = needle
      ? recipe.title.toLowerCase().includes(needle) ||
        recipe.description.toLowerCase().includes(needle)
      : true;
    return matchesCategory && matchesQuery;
  });
}

function hrefFor(query?: string, category?: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

function totalTime(recipe: Recipe) {
  return recipe.prepTimeMinutes + recipe.cookTimeMinutes;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const query = queryValue(params.q);
  const category = queryValue(params.category);
  const recipes = filterRecipes(RECIPES, query, category);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="/" className="font-serif text-xl tracking-tight">
            Recipe Box
          </a>
          <nav className="flex items-center gap-2 text-sm">
            <a
              href="/login"
              className="rounded-full px-3 py-2 text-muted hover:text-foreground"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-full bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
            >
              Sign up
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <section className="max-w-2xl">
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Recipes without the clutter.
          </h1>
          <p className="mt-3 text-lg text-muted">
            Browse community recipes by title, ingredient, or category. Sign up
            later to share your own.
          </p>
          <form action="/" className="mt-6" role="search">
            <label htmlFor="q" className="sr-only">
              Search recipes
            </label>
            <div className="flex gap-2">
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query ?? ""}
                placeholder="Search by title or ingredient"
                className="h-12 flex-1 rounded-full border border-border bg-card px-5 text-base outline-none ring-accent focus:ring-2"
              />
              {category ? (
                <input type="hidden" name="category" value={category} />
              ) : null}
              <button
                type="submit"
                className="h-12 rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        <section aria-label="Recipe categories">
          <div className="flex flex-wrap gap-2">
            <a
              href={hrefFor(query)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                !category
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              All
            </a>
            {CATEGORIES.map((name) => {
              const selected = category === name;
              return (
                <a
                  key={name}
                  href={hrefFor(query, selected ? undefined : name)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {name}
                </a>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="recent-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 id="recent-heading" className="font-serif text-2xl">
              Recently added
            </h2>
            <p className="text-sm text-muted">
              {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
            </p>
          </div>

          {recipes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-muted">
              No recipes match that search. Try another title, ingredient, or
              category.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                    <div
                      className="h-36"
                      style={{ backgroundColor: recipe.accent }}
                      aria-hidden="true"
                    />
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.categories.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-background px-2 py-0.5 text-xs text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-serif text-xl leading-snug">
                        {recipe.title}
                      </h3>
                      <p className="line-clamp-2 flex-1 text-sm text-muted">
                        {recipe.description}
                      </p>
                      <p className="text-sm text-muted">
                        {totalTime(recipe)} min, {recipe.servings} servings,{" "}
                        {recipe.difficulty}
                      </p>
                      <p className="text-sm">By {recipe.author}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted sm:px-6">
          Recipe Box is a simple place to save and share recipes. Accounts and
          uploads come next.
        </p>
      </footer>
    </div>
  );
}
