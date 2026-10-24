import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const label =
    (typeof user?.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    user?.email ||
    "Account";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href={user ? "/dashboard" : "/"}
          className="font-serif text-xl tracking-tight"
        >
          Recipe Box
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full px-3 py-2 text-muted hover:text-foreground"
              >
                Dashboard
              </Link>
              <span className="hidden max-w-40 truncate text-muted sm:inline">
                {label}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-muted hover:text-foreground"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-muted hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
