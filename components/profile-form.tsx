"use client";

import { useActionState } from "react";
import {
  updateProfile,
  type ProfileFormState,
} from "@/app/actions/profile";

const initialState: ProfileFormState = { error: null, message: null };

const fieldClass =
  "h-12 w-full rounded-full border border-border bg-card px-5 text-base outline-none ring-accent focus:ring-2";

const areaClass =
  "min-h-32 w-full rounded-2xl border border-border bg-card px-5 py-3 text-base outline-none ring-accent focus:ring-2";

export function ProfileForm({
  email,
  fullName,
  username,
  bio,
}: {
  email: string;
  fullName: string;
  username: string;
  bio: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          readOnly
          className={`${fieldClass} text-muted`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          defaultValue={fullName}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={32}
          defaultValue={username}
          className={fieldClass}
        />
        <p className="text-sm text-muted">
          3-32 characters. Letters, numbers, and underscores only.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          maxLength={280}
          defaultValue={bio}
          placeholder="A short note about you and how you cook."
          className={areaClass}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-accent" role="status">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
