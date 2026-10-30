"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ensureProfile,
  profileErrorMessage,
} from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export type CommentFormState = {
  error: string | null;
  ok: boolean;
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function commentBody(formData: FormData) {
  const body = field(formData, "body");
  if (!body) {
    return { error: "Write a comment first." as const };
  }
  if (body.length > 500) {
    return { error: "Comments can be at most 500 characters." as const };
  }
  return { error: null, body };
}

function revalidateRecipe(recipeId: string) {
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function toggleRecipeLike(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipeId = field(formData, "recipeId");
  if (!recipeId) {
    return;
  }

  try {
    await ensureProfile(supabase, user);
  } catch {
    return;
  }

  const { data: existing } = await supabase
    .from("recipe_likes")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("recipe_likes")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(profileErrorMessage(error));
    }
  } else {
    const { error } = await supabase.from("recipe_likes").insert({
      user_id: user.id,
      recipe_id: recipeId,
    });

    if (error && error.code !== "23505") {
      throw new Error(profileErrorMessage(error));
    }
  }

  revalidateRecipe(recipeId);
}

export async function addRecipeComment(
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipeId = field(formData, "recipeId");
  if (!recipeId) {
    return { error: "Recipe is missing.", ok: false };
  }

  try {
    await ensureProfile(supabase, user);
  } catch (profileError) {
    return { error: profileErrorMessage(profileError), ok: false };
  }

  const parsed = commentBody(formData);
  if (parsed.error || !parsed.body) {
    return { error: parsed.error, ok: false };
  }

  const { error } = await supabase.from("recipe_comments").insert({
    user_id: user.id,
    recipe_id: recipeId,
    body: parsed.body,
  });

  if (error) {
    return { error: profileErrorMessage(error), ok: false };
  }

  revalidateRecipe(recipeId);
  return { error: null, ok: true };
}

export async function updateRecipeComment(
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipeId = field(formData, "recipeId");
  const commentId = field(formData, "commentId");
  if (!recipeId || !commentId) {
    return { error: "Comment is missing.", ok: false };
  }

  const parsed = commentBody(formData);
  if (parsed.error || !parsed.body) {
    return { error: parsed.error, ok: false };
  }

  const { data, error } = await supabase
    .from("recipe_comments")
    .update({ body: parsed.body })
    .eq("id", commentId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: profileErrorMessage(error), ok: false };
  }

  if (!data) {
    return { error: "You can only edit your own comments.", ok: false };
  }

  revalidateRecipe(recipeId);
  return { error: null, ok: true };
}

export async function deleteRecipeComment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipeId = field(formData, "recipeId");
  const commentId = field(formData, "commentId");
  if (!recipeId || !commentId) {
    return;
  }

  const { error } = await supabase
    .from("recipe_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(profileErrorMessage(error));
  }

  revalidateRecipe(recipeId);
}
