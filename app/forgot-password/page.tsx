import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const magicLinkEnabled = !!process.env.AUTH_RESEND_KEY;
  return <ForgotPasswordForm magicLinkEnabled={magicLinkEnabled} />;
}
