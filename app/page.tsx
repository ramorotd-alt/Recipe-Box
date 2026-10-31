import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-16 sm:px-6">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Recipes without the clutter.
        </h1>
        <p className="mt-3 text-muted">
          Create an account to save and share recipes, or log in if you already
          have one.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Start creating
          </Link>
          <p className="text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
