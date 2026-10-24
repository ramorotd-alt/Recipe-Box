"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type RecipeFormState = {
  error: string | null;
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function createRecipe(
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = field(formData, "title");
  const description = field(formData, "description");
  const category = field(formData, "category");
  const difficulty = field(formData, "difficulty");
  const cookingTimeRaw = field(formData, "cookingTime");
  const ingredients = lines(field(formData, "ingredients"));
  const instructions = lines(field(formData, "instructions"));
  const cookingTime = cookingTimeRaw ? Number(cookingTimeRaw) : null;

  if (!title || !category) {
    return { error: "Title and category are required." };
  }

  if (ingredients.length === 0 || instructions.length === 0) {
    return { error: "Add at least one ingredient and one instruction." };
  }

  if (
    cookingTimeRaw &&
    (Number.isNaN(cookingTime) || (cookingTime ?? 0) < 0)
  ) {
    return { error: "Cooking time must be a number of minutes." };
  }

  const { error } = await supabase.from("recipes").insert({
    user_id: user.id,
    title,
    description: description || null,
    category,
    difficulty: difficulty || null,
    cooking_time: cookingTime,
    ingredients,
    instructions,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
