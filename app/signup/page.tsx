import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  const googleEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return <SignupForm googleEnabled={googleEnabled} />;
}
