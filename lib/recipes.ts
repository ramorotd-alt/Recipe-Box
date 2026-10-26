import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Recipe } from "@/lib/supabase/database.types";

export type RecipeSummary = Pick<
  Recipe,
  | "id"
  | "user_id"
  | "title"
  | "description"
  | "cooking_time"
  | "difficulty"
  | "category"
  | "created_at"
>;

export async function loadAuthorsById(
  supabase: SupabaseClient<Database>,
  userIds: string[],
) {
  const authorsById = new Map<string, { full_name: string; username: string }>();
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return authorsById;
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .in("id", uniqueIds);

  for (const profile of profiles ?? []) {
    authorsById.set(profile.id, {
      full_name: profile.full_name,
      username: profile.username,
    });
  }

  return authorsById;
}

export function authorLabel(
  profile: { full_name: string; username: string } | undefined,
) {
  return profile?.full_name || profile?.username || "A cook";
}
