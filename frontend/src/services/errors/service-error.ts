export type ServiceErrorCode =
  | "network"
  | "not-found"
  | "unauthorized"
  | "conflict"
  | "invalid-credentials"
  | "invalid-otp"
  | "expired-otp"
  | "unknown";

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly code: ServiceErrorCode = "unknown",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ServiceError";
  }
}
