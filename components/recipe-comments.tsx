"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  addRecipeComment,
  deleteRecipeComment,
  updateRecipeComment,
  type CommentFormState,
} from "@/app/actions/social";

export type RecipeCommentItem = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author: string;
};

const initialState: CommentFormState = { error: null, ok: false };

const areaClass =
  "min-h-24 w-full rounded-2xl border border-border bg-card px-5 py-3 text-base outline-none ring-accent focus:ring-2";

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

function CommentForm({
  recipeId,
  action,
  initialBody = "",
  submitLabel,
  pendingLabel,
  onCancel,
}: {
  recipeId: string;
  action: (
    prevState: CommentFormState,
    formData: FormData,
  ) => Promise<CommentFormState>;
  initialBody?: string;
  submitLabel: string;
  pendingLabel: string;
  onCancel?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.ok || pending) {
      return;
    }
    formRef.current?.reset();
    onCancel?.();
  }, [state, pending, onCancel]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="recipeId" value={recipeId} />
      <label htmlFor={`comment-body-${recipeId}-${submitLabel}`} className="sr-only">
        Comment
      </label>
      <textarea
        id={`comment-body-${recipeId}-${submitLabel}`}
        name="body"
        required
        maxLength={500}
        defaultValue={initialBody}
        placeholder="Share a note about this recipe."
        className={areaClass}
      />
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-full px-4 text-sm text-muted hover:text-foreground"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function CommentItem({
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

  async function updateAction(
    prevState: CommentFormState,
    formData: FormData,
  ) {
    formData.set("commentId", comment.id);
    return updateRecipeComment(prevState, formData);
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{comment.author}</p>
        <p className="text-xs text-muted">
          {formatWhen(comment.created_at)}
          {edited ? " (edited)" : ""}
        </p>
      </div>
      {editing ? (
        <div className="mt-3">
          <CommentForm
            recipeId={recipeId}
            action={updateAction}
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
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl">
        Comments{comments.length ? ` (${comments.length})` : ""}
      </h2>
      <CommentForm
        recipeId={recipeId}
        action={addRecipeComment}
        submitLabel="Post comment"
        pendingLabel="Posting..."
      />
      {comments.length === 0 ? (
        <p className="text-sm text-muted">No comments yet. Be the first.</p>
      ) : (
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
      )}
    </section>
  );
}
