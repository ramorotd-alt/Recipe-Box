import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = {
  title: "Auth error - Recipe Box",
};

export default async function AuthErrorPage({
  searchParams,
}: PageProps<"/auth/error">) {
  const params = await searchParams;
  const error =
    typeof params.error === "string"
      ? params.error
      : "Something went wrong with authentication.";

  return (
    <AuthPage title="Could not finish sign-in" description={error}>
      <Link
        href="/login"
        className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Back to log in
      </Link>
    </AuthPage>
  );
}
