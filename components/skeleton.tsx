export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-border ${className ?? "h-4 w-full rounded-full"}`}
    />
  );
}

export function RecipeCardSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <Skeleton className="mt-auto h-4 w-24 rounded-full" />
      </div>
    </article>
  );
}

function LoadingLabel() {
  return <span className="sr-only">Loading</span>;
}

export function RecipeGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <RecipeCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export function DashboardSkeleton() {
  return (
    <main
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6"
      aria-busy="true"
    >
      <LoadingLabel />
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-48 rounded-full" />
          <Skeleton className="h-5 w-72 rounded-full" />
        </div>
        <Skeleton className="h-12 w-32 rounded-full" />
      </section>
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
    </main>
  );
}

export function ProfileSkeleton() {
  return (
    <main
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6"
      aria-busy="true"
    >
      <LoadingLabel />
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:mx-0 sm:p-8">
        <Skeleton className="h-9 w-40 rounded-full" />
        <Skeleton className="mt-3 h-4 w-full rounded-full" />
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40 rounded-full" />
        <RecipeGridSkeleton />
      </section>
    </main>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6"
      aria-busy="true"
    >
      <LoadingLabel />
      <Skeleton className="h-4 w-36 rounded-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-10 w-3/4 rounded-full" />
        <Skeleton className="h-5 w-full rounded-full" />
        <Skeleton className="h-4 w-56 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <Skeleton className="h-4 w-3/5 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-44 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-36 rounded-full" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </main>
  );
}

export function FormPageSkeleton() {
  return (
    <main
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6"
      aria-busy="true"
    >
      <LoadingLabel />
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <Skeleton className="h-9 w-48 rounded-full" />
        <Skeleton className="mt-3 h-4 w-full rounded-full" />
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </section>
    </main>
  );
}

export function SiteHeaderSkeleton() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <span className="font-serif text-xl tracking-tight">Recipe Box</span>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-16 rounded-full" />
        </div>
      </div>
    </header>
  );
}
