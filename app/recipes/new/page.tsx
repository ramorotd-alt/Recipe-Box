import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipe-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Add recipe - Recipe Box",
};

export default async function NewRecipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-serif text-3xl tracking-tight">Add a recipe</h1>
        <p className="mt-2 mb-6 text-muted">
          Share a dish with the community. Use one ingredient or step per line.
        </p>
        <RecipeForm />
      </section>
    </main>
  );
}
