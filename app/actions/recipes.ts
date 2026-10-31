"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

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

function parseRecipeForm(formData: FormData) {
  const title = field(formData, "title");
  const description = field(formData, "description");
  const category = field(formData, "category");
  const difficulty = field(formData, "difficulty");
  const cookingTimeRaw = field(formData, "cookingTime");
  const ingredients = lines(field(formData, "ingredients"));
  const instructions = lines(field(formData, "instructions"));
  const cookingTime = cookingTimeRaw ? Number(cookingTimeRaw) : null;

  if (!title || !category) {
    return { error: "Title and category are required." as const };
  }

  if (ingredients.length === 0 || instructions.length === 0) {
    return { error: "Add at least one ingredient and one instruction." as const };
  }

  if (cookingTimeRaw && (Number.isNaN(cookingTime) || (cookingTime ?? 0) < 0)) {
    return { error: "Cooking time must be a number of minutes." as const };
  }

  return {
    error: null,
    values: {
      title,
      description: description || null,
      category,
      difficulty: difficulty || null,
      cooking_time: cookingTime,
      ingredients,
      instructions,
    },
  };
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

  try {
    await ensureProfile(supabase, user);
  } catch (profileError) {
    return { error: profileErrorMessage(profileError) };
  }

  const parsed = parseRecipeForm(formData);
  if (parsed.error || !parsed.values) {
    return { error: parsed.error };
  }

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      ...parsed.values,
    })
    .select("id")
    .single();

  if (error) {
    return { error: profileErrorMessage(error) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  redirect(`/recipes/${data.id}`);
}

export async function updateRecipe(
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

  const recipeId = field(formData, "recipeId");
  if (!recipeId) {
    return { error: "Recipe is missing." };
  }

  const parsed = parseRecipeForm(formData);
  if (parsed.error || !parsed.values) {
    return { error: parsed.error };
  }

  const { data, error } = await supabase
    .from("recipes")
    .update(parsed.values)
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: profileErrorMessage(error) };
  }

  if (!data) {
    return { error: "You can only edit your own recipes." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/saved");
  revalidatePath(`/recipes/${recipeId}`);
  redirect(`/recipes/${recipeId}`);
}

export async function deleteRecipe(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipeId = field(formData, "recipeId");
  if (!recipeId) {
    redirect("/dashboard");
  }

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(profileErrorMessage(error));
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/saved");
  redirect("/dashboard");
}
