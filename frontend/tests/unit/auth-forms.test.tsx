import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { GeneralLoginForm } from "@/features/auth/components/general-login-form";
import { OtpVerificationForm } from "@/features/auth/components/otp-verification-form";
import { RegistrationForm } from "@/features/auth/components/registration-form";
import {
  isPasswordValid,
  validateCuetEmail,
  validateOtp,
  validateUsername,
} from "@/features/auth/lib/auth-validation";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  register: vi.fn(),
  verifyOtp: vi.fn(),
  resendOtp: vi.fn(),
  loginGeneral: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/services", () => ({
  authService: {
    register: mocks.register,
    verifyOtp: mocks.verifyOtp,
    resendOtp: mocks.resendOtp,
    loginGeneral: mocks.loginGeneral,
  },
}));

describe("authentication validation", () => {
  test("accepts only CUET domains and enforces registration rules", () => {
    expect(validateCuetEmail("u2204067@student.cuet.ac.bd")).toBeUndefined();
    expect(validateCuetEmail("teacher@cuet.ac.bd")).toBeUndefined();
    expect(validateCuetEmail("student@gmail.com")).toMatch(/@cuet\.ac\.bd/);
    expect(validateUsername("a")).toMatch(/at least 3/);
    expect(isPasswordValid("StrongPass123")).toBe(true);
    expect(isPasswordValid("weak")).toBe(false);
    expect(validateOtp("123456")).toBeUndefined();
    expect(validateOtp("123")).toMatch(/6-digit/);
  });
});

describe("authentication forms", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.register.mockReset();
    mocks.verifyOtp.mockReset();
    mocks.resendOtp.mockReset();
    mocks.loginGeneral.mockReset();
  });

  test("registration presents validation and switches the role-specific ID", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("First name is required.")).toBeVisible();
    expect(screen.getByText("CUET email is required.")).toBeVisible();

    const idInput = screen.getByLabelText(/Student ID/);
    await user.type(idInput, "2204001");
    await user.click(screen.getByLabelText("Teacher"));
    expect(screen.getByLabelText(/Teacher ID/)).toHaveValue("");

    await user.type(screen.getByLabelText(/CUET email/), "user@gmail.com");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      await screen.findByText(
        "Use your @cuet.ac.bd or @student.cuet.ac.bd email address.",
      ),
    ).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  test("OTP form validates and submits the six-digit code", async () => {
    const user = userEvent.setup();
    mocks.verifyOtp.mockResolvedValue(undefined);
    render(<OtpVerificationForm email="u2204067@student.cuet.ac.bd" />);

    await user.click(screen.getByRole("button", { name: "Verify account" }));
    expect(await screen.findByText("Enter the verification code.")).toBeVisible();

    await user.type(screen.getByLabelText(/Verification code/), "123456");
    await user.click(screen.getByRole("button", { name: "Verify account" }));
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      email: "u2204067@student.cuet.ac.bd",
      otp: "123456",
    });
    expect(mocks.push).toHaveBeenCalledWith(
      "/login?verified=1&email=u2204067%40student.cuet.ac.bd",
    );
  });

  test("login form exposes verified state and rejects blank credentials", async () => {
    const user = userEvent.setup();
    render(<GeneralLoginForm registrationVerified />);

    expect(screen.getByRole("status")).toHaveTextContent("email is verified");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Username or email is required.")).toBeVisible();
    expect(screen.getByText("Password is required.")).toBeVisible();
    expect(mocks.loginGeneral).not.toHaveBeenCalled();
  });
});
