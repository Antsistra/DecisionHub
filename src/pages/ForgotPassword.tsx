import ForgotPasswordForm from "@/forms/forgotPassword-form";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm></ForgotPasswordForm>
      </div>
    </div>
  );
}
