import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
import { UpdatePasswordForm } from "@/components/update-password-form";

export const metadata: Metadata = {
  title: "Update password - Recipe Box",
};

export default function UpdatePasswordPage() {
  return (
    <AuthPage
      title="Choose a new password"
      description="You are signed in from the reset link. Set a new password below."
    >
      <UpdatePasswordForm />
    </AuthPage>
  );
}
