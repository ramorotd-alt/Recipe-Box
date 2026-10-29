import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipe-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit recipe - Recipe Box",
};

export default async function EditRecipePage({
  params,
}: PageProps<"/recipes/[id]/edit">) {
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
      "id, user_id, title, description, ingredients, instructions, cooking_time, difficulty, category",
    )
    .eq("id", id)
    .maybeSingle();

  if (!recipe) {
    notFound();
  }

  if (recipe.user_id !== user.id) {
    redirect(`/recipes/${id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="mb-4">
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-sm text-muted hover:text-foreground"
          >
            Back to recipe
          </Link>
        </p>
        <h1 className="font-serif text-3xl tracking-tight">Edit recipe</h1>
        <p className="mt-2 mb-6 text-muted">
          Update the dish. Use one ingredient or step per line.
        </p>
        <RecipeForm recipe={recipe} />
      </section>
    </main>
  );
}
