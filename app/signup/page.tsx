import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Sign up - Recipe Box",
};

export default function SignupPage() {
  return (
    <AuthPage
      title="Create an account"
      description="Save and share recipes with a free account."
    >
      <SignupForm />
    </AuthPage>
  );
}
