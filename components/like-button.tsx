"use client";

import { useFormStatus } from "react-dom";
import { toggleRecipeLike } from "@/app/actions/social";

function LikeSubmit({ liked, likeCount }: { liked: boolean; likeCount: number }) {
  const { pending } = useFormStatus();
  const label = liked ? "Unlike" : "Like";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      aria-label={`${label}. ${likeCount} ${likeCount === 1 ? "like" : "likes"}`}
      className={`rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-60 ${
        liked
          ? "border-accent bg-accent text-white hover:bg-accent-hover"
          : "border-border bg-card text-foreground hover:border-accent"
      }`}
    >
      {pending ? "Saving..." : `${liked ? "Liked" : "Like"} · ${likeCount}`}
    </button>
  );
}

export function LikeButton({
  recipeId,
  liked,
  likeCount,
}: {
  recipeId: string;
  liked: boolean;
  likeCount: number;
}) {
  return (
    <form action={toggleRecipeLike}>
      <input type="hidden" name="recipeId" value={recipeId} />
      <LikeSubmit liked={liked} likeCount={likeCount} />
    </form>
  );
}
