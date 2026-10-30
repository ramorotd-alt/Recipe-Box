import Link from "next/link";

export function RecipeSearchForm({ query }: { query: string }) {
  return (
    <form
      action="/dashboard"
      method="get"
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <label htmlFor="q" className="sr-only">
        Search recipes
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Search by title, category, or cook"
        className="h-12 w-full rounded-full border border-border bg-card px-5 text-base outline-none ring-accent focus:ring-2"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Search
        </button>
        {query ? (
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-full px-4 text-sm text-muted hover:text-foreground"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}