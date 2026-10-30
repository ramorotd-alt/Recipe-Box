import { CommentForm } from "@/components/comment-form";
import {
  CommentList,
  type RecipeCommentItem,
} from "@/components/comment-item";

export type { RecipeCommentItem };

export function RecipeComments({
  recipeId,
  comments,
  currentUserId,
}: {
  recipeId: string;
  comments: RecipeCommentItem[];
  currentUserId: string;
}) {
  return (
    <section id="comments" className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl">
        Comments{comments.length ? ` (${comments.length})` : ""}
      </h2>
      <CommentForm recipeId={recipeId} />
      <CommentList
        comments={comments}
        recipeId={recipeId}
        currentUserId={currentUserId}
      />
    </section>
  );
}
