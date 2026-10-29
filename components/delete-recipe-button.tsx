"use client";

import { deleteRecipe } from "@/app/actions/recipes";

export function DeleteRecipeButton({ recipeId }: { recipeId: string }) {
  return (
    <form
      action={deleteRecipe}
      onSubmit={(event) => {
        if (!window.confirm("Delete this recipe? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="recipeId" value={recipeId} />
      <button
        type="submit"
        className="rounded-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
