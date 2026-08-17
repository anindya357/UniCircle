import { AuthPage } from "@/features/auth/components/auth-page";
import { OtpVerificationForm } from "@/features/auth/components/otp-verification-form";

type VerifyOtpPageProps = Readonly<{
  searchParams: Promise<{ email?: string }>;
}>;

export default async function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const { email } = await searchParams;

  return (
    <AuthPage
      eyebrow="Email verification"
      title="Check your inbox"
      description="Enter the six-digit code to verify your CUET email and activate your account."
      panelTitle="A verified campus community."
      panelDescription="Institutional email verification keeps UniCircle focused on authentic CUET connections."
      panelItems={[
        "Six-digit email verification",
        "Expired and invalid-code feedback",
        "Safe resend cooldown",
      ]}
    >
      <OtpVerificationForm email={email} />
    </AuthPage>
  );
}
