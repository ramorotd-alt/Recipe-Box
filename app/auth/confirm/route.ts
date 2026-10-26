import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await ensureProfile(supabase, user);
        } catch {
          // Session is valid; profile can be created on the next dashboard visit.
        }
      }
      redirect(next);
    }

    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/error?error=Missing%20confirmation%20link");
}
