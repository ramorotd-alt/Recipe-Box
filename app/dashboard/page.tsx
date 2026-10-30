import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardContent } from "@/app/dashboard/content";
import { RecipeGridSkeleton, Skeleton } from "@/components/skeleton";

export const metadata: Metadata = {
  title: "Dashboard - Recipe Box",
};

function DashboardListsFallback() {
  return (
    <>
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40 rounded-full" />
        <RecipeGridSkeleton />
      </section>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48 rounded-full" />
        <RecipeGridSkeleton />
      </section>
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const categoryParam =
    typeof params.category === "string" ? params.category.trim() : "";
  const difficultyParam =
    typeof params.difficulty === "string" ? params.difficulty.trim() : "";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Your kitchen
          </h1>
          <p className="mt-2 text-muted">
            Your recipes, plus dishes from other cooks.
          </p>
        </div>
        <Link
          href="/recipes/new"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Add recipe
        </Link>
      </section>

      <Suspense
        key={`${query}-${categoryParam}-${difficultyParam}`}
        fallback={<DashboardListsFallback />}
      >
        <DashboardContent
          query={query}
          categoryParam={categoryParam}
          difficultyParam={difficultyParam}
        />
      </Suspense>
    </main>
  );
}
