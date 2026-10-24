"use client";

import { useActionState } from "react";
import { createRecipe, type RecipeFormState } from "@/app/actions/recipes";

const initialState: RecipeFormState = { error: null };

const fieldClass =
  "h-12 w-full rounded-full border border-border bg-card px-5 text-base outline-none ring-accent focus:ring-2";

const areaClass =
  "min-h-32 w-full rounded-2xl border border-border bg-card px-5 py-3 text-base outline-none ring-accent focus:ring-2";

const CATEGORIES = [
  "Breakfast",
  "Dinner",
  "Vegan",
  "Italian",
  "Dessert",
  "Quick",
];

export function RecipeForm() {
  const [state, formAction, pending] = useActionState(
    createRecipe,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input id="title" name="title" required className={fieldClass} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea id="description" name="description" className={areaClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue="Dinner"
            className={fieldClass}
          >
            {CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue="easy"
            className={fieldClass}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cookingTime" className="text-sm font-medium">
            Cooking time (min)
          </label>
          <input
            id="cookingTime"
            name="cookingTime"
            type="number"
            min={0}
            className={fieldClass}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="ingredients" className="text-sm font-medium">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          name="ingredients"
          required
          placeholder="One ingredient per line"
          className={areaClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="instructions" className="text-sm font-medium">
          Instructions
        </label>
        <textarea
          id="instructions"
          name="instructions"
          required
          placeholder="One step per line"
          className={areaClass}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save recipe"}
      </button>
    </form>
  );
}
