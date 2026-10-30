"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  addRecipeComment,
  type CommentFormState,
} from "@/app/actions/social";

const initialState: CommentFormState = { error: null, ok: false };

const MAX_LENGTH = 500;

const areaClass =
  "min-h-24 w-full rounded-2xl border border-border bg-card px-5 py-3 text-base outline-none ring-accent focus:ring-2";

export function CommentForm({
  recipeId,
  action = addRecipeComment,
  initialBody = "",
  submitLabel = "Post comment",
  pendingLabel = "Posting...",
  onCancel,
  commentId,
}: {
  recipeId: string;
  action?: (
    prevState: CommentFormState,
    formData: FormData,
  ) => Promise<CommentFormState>;
  initialBody?: string;
  submitLabel?: string;
  pendingLabel?: string;
  onCancel?: () => void;
  commentId?: string;
}) {
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [length, setLength] = useState(initialBody.length);

  useEffect(() => {
    if (!state.ok || pending) {
      return;
    }
    formRef.current?.reset();
    setLength(0);
    onCancel?.();
  }, [state, pending, onCancel]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="recipeId" value={recipeId} />
      {commentId ? (
        <input type="hidden" name="commentId" value={commentId} />
      ) : null}
      <label htmlFor={fieldId} className="sr-only">
        Comment
      </label>
      <textarea
        id={fieldId}
        name="body"
        required
        maxLength={MAX_LENGTH}
        defaultValue={initialBody}
        placeholder="Share a note about this recipe."
        onChange={(event) => setLength(event.target.value.length)}
        className={areaClass}
      />
      <p className="text-xs text-muted">
        {length}/{MAX_LENGTH}
      </p>
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
