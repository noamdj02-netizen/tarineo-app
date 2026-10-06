export type IntegrationErrorCode =
  | "unauthorized"
  | "forbidden"
  | "feature_requires_pro"
  | "invalid_file"
  | "file_too_large"
  | "idempotency_conflict"
  | "extraction_failed"
  | "rate_limited"
  | "internal_error"
  | "invalid_request";

export function integrationErrorStatus(code: IntegrationErrorCode): number {
  switch (code) {
    case "unauthorized":
      return 401;
    case "forbidden":
    case "feature_requires_pro":
      return 403;
    case "invalid_file":
    case "invalid_request":
      return 400;
    case "file_too_large":
      return 413;
    case "idempotency_conflict":
      return 409;
    case "extraction_failed":
      return 422;
    case "rate_limited":
      return 429;
    default:
      return 500;
  }
}

export function integrationErrorBody(
  code: IntegrationErrorCode,
  extra?: { feature?: string; message?: string },
): { error: IntegrationErrorCode; feature?: string; message?: string } {
  const body: { error: IntegrationErrorCode; feature?: string; message?: string } = { error: code };
  if (extra?.feature) body.feature = extra.feature;
  if (extra?.message) body.message = extra.message;
  return body;
}
