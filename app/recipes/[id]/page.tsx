import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { LikeButton } from "@/components/like-button";
import { RecipeComments } from "@/components/recipe-comments";
import { authorLabel, loadAuthorsById } from "@/lib/recipes";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/recipes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("title")
    .eq("id", id)
    .maybeSingle();

  return {
    title: data?.title ? `${data.title} - Recipe Box` : "Recipe - Recipe Box",
  };
}

export default async function RecipePage({
  params,
}: PageProps<"/recipes/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      "id, user_id, title, description, ingredients, instructions, cooking_time, difficulty, category, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!recipe) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", recipe.user_id)
    .maybeSingle();

  const author = authorLabel(profile ?? undefined);
  const isOwner = recipe.user_id === user.id;

  const [
    { count: likeCount },
    { data: likedRow },
    { data: commentRows },
  ] = await Promise.all([
    supabase
      .from("recipe_likes")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", recipe.id),
    supabase
      .from("recipe_likes")
      .select("id")
      .eq("recipe_id", recipe.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("recipe_comments")
      .select("id, body, created_at, updated_at, user_id")
      .eq("recipe_id", recipe.id)
      .order("created_at", { ascending: true }),
  ]);

  const comments = commentRows ?? [];
  const commentAuthors = await loadAuthorsById(
    supabase,
    comments.map((comment) => comment.user_id),
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <p>
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
          Back to dashboard
        </Link>
      </p>
      <header className="flex flex-col gap-3">
        <span className="w-fit rounded-full bg-card px-3 py-1 text-sm text-muted">
          {recipe.category}
        </span>
        <h1 className="font-serif text-4xl tracking-tight">{recipe.title}</h1>
        {recipe.description ? (
          <p className="text-lg text-muted">{recipe.description}</p>
        ) : null}
        <p className="text-sm text-muted">
          {[
            recipe.cooking_time != null ? `${recipe.cooking_time} min` : null,
            recipe.difficulty,
            `By ${author}${isOwner ? " (you)" : ""}`,
          ]
            .filter(Boolean)
            .join(" | ")}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <LikeButton
            recipeId={recipe.id}
            liked={Boolean(likedRow)}
            likeCount={likeCount ?? 0}
          />
          {isOwner ? (
            <>
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Edit
              </Link>
              <DeleteRecipeButton recipeId={recipe.id} />
            </>
          ) : null}
        </div>
      </header>

      <section>
        <h2 className="font-serif text-2xl">Ingredients</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Instructions</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5">
          {recipe.instructions.map((step, index) => (
            <li key={`${index}-${step}`}>{step}</li>
          ))}
        </ol>
      </section>

      <RecipeComments
        recipeId={recipe.id}
        currentUserId={user.id}
        comments={comments.map((comment) => ({
          ...comment,
          author: authorLabel(commentAuthors.get(comment.user_id)),
        }))}
      />
    </main>
  );
}
