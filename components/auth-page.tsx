export function AuthPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
        <p className="mt-2 mb-6 text-muted">{description}</p>
        {children}
      </section>
    </main>
  );
}
