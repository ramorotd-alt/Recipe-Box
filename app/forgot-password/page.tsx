import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password - Recipe Box",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      title="Reset password"
      description="Enter your email and we will send a reset link."
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
