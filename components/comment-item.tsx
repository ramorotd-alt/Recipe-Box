"use client";

import { useEffect, useState } from "react";
import {
  deleteRecipeComment,
  updateRecipeComment,
} from "@/app/actions/social";
import { CommentForm } from "@/components/comment-form";

export type RecipeCommentItem = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author: string;
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function CommentTime({
  createdAt,
  edited,
}: {
  createdAt: string;
  edited: boolean;
}) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const when = formatWhen(createdAt);
    setLabel(edited ? `${when} (edited)` : when);
  }, [createdAt, edited]);

  if (!label) {
    return null;
  }

  return <p className="text-xs text-muted">{label}</p>;
}

export function CommentItem({
  comment,
  recipeId,
  isOwner,
}: {
  comment: RecipeCommentItem;
  recipeId: string;
  isOwner: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const edited =
    comment.updated_at && comment.updated_at !== comment.created_at;

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{comment.author}</p>
        <CommentTime createdAt={comment.created_at} edited={Boolean(edited)} />
      </div>
      {editing ? (
        <div className="mt-3">
          <CommentForm
            recipeId={recipeId}
            commentId={comment.id}
            action={updateRecipeComment}
            initialBody={comment.body}
            submitLabel="Save"
            pendingLabel="Saving..."
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap">{comment.body}</p>
      )}
      {isOwner && !editing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-muted hover:text-foreground"
          >
            Edit
          </button>
          <form
            action={deleteRecipeComment}
            onSubmit={(event) => {
              if (!window.confirm("Delete this comment?")) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="recipeId" value={recipeId} />
            <input type="hidden" name="commentId" value={comment.id} />
            <button
              type="submit"
              className="text-sm text-red-700 hover:underline"
            >
              Delete
            </button>
          </form>
        </div>
      ) : null}
    </li>
  );
}

export function CommentList({
  comments,
  recipeId,
  currentUserId,
}: {
  comments: RecipeCommentItem[];
  recipeId: string;
  currentUserId: string;
}) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted">No comments yet. Be the first.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          recipeId={recipeId}
          isOwner={comment.user_id === currentUserId}
        />
      ))}
    </ul>
  );
}
