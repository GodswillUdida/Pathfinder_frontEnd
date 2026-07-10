// lib/api/errors.ts

export class ApiError extends Error {
  status:       number;
  data?:        unknown;
  isAuthError?: boolean;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name    = "ApiError";
    this.status  = status;
    this.data    = data;

    // Correct prototype chain for `instanceof` checks across transpile targets
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** True for any 4xx/5xx the server returned */
  get isHttpError(): boolean {
    return this.status >= 400;
  }

  /** True specifically for 401 Unauthorized */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True for 403 Forbidden */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True for 404 Not Found */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** True for 422 Unprocessable Entity (validation errors from server) */
  get isValidationError(): boolean {
    return this.status === 422;
  }

  /** True for network / abort errors (status === 0) */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /** True for any 5xx server error */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Extract field-level validation errors when the server sends:
   * { errors: { fieldName: ["message1"] } }
   */
  get fieldErrors(): Record<string, string[]> | null {
    if (
      this.data &&
      typeof this.data === "object" &&
      "errors" in this.data &&
      typeof (this.data as Record<string, unknown>).errors === "object"
    ) {
      return (this.data as { errors: Record<string, string[]> }).errors;
    }
    return null;
  }

  /** Safe serialisation for logging / Sentry */
  toJSON() {
    return {
      name:         this.name,
      message:      this.message,
      status:       this.status,
      isAuthError:  this.isAuthError ?? false,
      data:         this.data,
    };
  }
}