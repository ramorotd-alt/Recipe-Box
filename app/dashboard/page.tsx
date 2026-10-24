import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard - Recipe Box",
};

type CommunityRecipe = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cooking_time: number | null;
  difficulty: string | null;
  category: string;
  created_at: string | null;
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
    Math.abs(
      id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0),
    ) % CARD_COLORS.length;
  return CARD_COLORS[index];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, user_id, title, description, cooking_time, difficulty, category, created_at",
    )
    .neq("user_id", user.id)
    .order("created_at", { ascending: false });

  const recipes = (data ?? []) as CommunityRecipe[];
  const authorIds = [...new Set(recipes.map((recipe) => recipe.user_id))];

  const authorsById = new Map<string, { full_name: string; username: string }>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username")
      .in("id", authorIds);

    for (const profile of profiles ?? []) {
      authorsById.set(profile.id, {
        full_name: profile.full_name,
        username: profile.username,
      });
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Community recipes
          </h1>
          <p className="mt-2 text-muted">
            Dishes shared by other cooks on Recipe Box.
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
      ) : recipes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-muted">
          No recipes from other cooks yet. Check back after someone publishes.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const profile = authorsById.get(recipe.user_id);
            const author =
              profile?.full_name || profile?.username || "A cook";

            return (
              <li key={recipe.id}>
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
                    <h2 className="font-serif text-xl leading-snug">
                      {recipe.title}
                    </h2>
                    {recipe.description ? (
                      <p className="line-clamp-2 flex-1 text-sm text-muted">
                        {recipe.description}
                      </p>
                    ) : (
                      <p className="flex-1" />
                    )}
                    <p className="text-sm text-muted">
                      {[
                        recipe.cooking_time != null
                          ? `${recipe.cooking_time} min`
                          : null,
                        recipe.difficulty,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-sm">By {author}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
