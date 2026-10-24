import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log in - Recipe Box",
};

export default function LoginPage() {
  return (
    <AuthPage title="Log in" description="Welcome back. Use your email and password.">
      <LoginForm />
    </AuthPage>
  );
}
