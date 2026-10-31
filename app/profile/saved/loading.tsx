import { RecipeGridSkeleton, Skeleton } from "@/components/skeleton";

export default function SavedRecipesLoading() {
  return (
    <main
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
      <Skeleton className="h-4 w-32 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-56 rounded-full" />
        <Skeleton className="h-5 w-72 rounded-full" />
      </div>
      <RecipeGridSkeleton />
    </main>
  );
}
