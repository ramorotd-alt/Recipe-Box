export function RecipeSocialStats({
  likeCount,
  commentCount,
}: {
  likeCount: number;
  commentCount: number;
}) {
  return (
    <p className="flex flex-wrap items-center gap-3 text-xs text-muted">
      <span>
        {likeCount} {likeCount === 1 ? "like" : "likes"}
      </span>
      <span>
        {commentCount} {commentCount === 1 ? "comment" : "comments"}
      </span>
    </p>
  );
}

export function CommentCountLink({ count }: { count: number }) {
  return (
    <a
      href="#comments"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-accent"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 8h10M7 12h6" />
        <path d="M21 12a8.5 8.5 0 0 1-1.4 4.7L21 21l-4.6-1.2A8.5 8.5 0 1 1 21 12Z" />
      </svg>
      <span>
        {count} {count === 1 ? "comment" : "comments"}
      </span>
    </a>
  );
}
