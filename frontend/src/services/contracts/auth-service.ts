import type {
  AdminLoginInput,
  AuthenticationResult,
  GeneralLoginInput,
  OtpVerificationInput,
  RegistrationInput,
  RegistrationResult,
} from "@/features/auth/types/auth";

export interface AuthService {
  register(input: RegistrationInput): Promise<RegistrationResult>;
  verifyOtp(input: OtpVerificationInput): Promise<void>;
  resendOtp(email: string): Promise<void>;
  loginGeneral(input: GeneralLoginInput): Promise<AuthenticationResult>;
  loginAdmin(input: AdminLoginInput): Promise<AuthenticationResult>;
}
