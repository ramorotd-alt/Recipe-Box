"use client";

import { useFormStatus } from "react-dom";
import { toggleRecipeLike } from "@/app/actions/social";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

function LikeSubmit({ liked, likeCount }: { liked: boolean; likeCount: number }) {
  const { pending } = useFormStatus();
  const label = liked ? "Unlike" : "Like";
  const countLabel = `${likeCount} ${likeCount === 1 ? "like" : "likes"}`;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      aria-label={`${label}. ${countLabel}`}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-60 ${
        liked
          ? "border-accent bg-accent text-white hover:bg-accent-hover"
          : "border-border bg-card text-foreground hover:border-accent"
      }`}
    >
      <HeartIcon filled={liked} />
      <span>{pending ? "Saving..." : liked ? "Liked" : "Like"}</span>
      <span className={liked ? "text-white/80" : "text-muted"}>{likeCount}</span>
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
