export function isMissingAutomationTable(error: { message?: string; code?: string } | null) {
  const m = error?.message ?? "";
  return error?.code === "42P01" || /does not exist|schema cache|Could not find the table/i.test(m);
}

export function isUniqueViolation(error: { message?: string; code?: string } | null) {
  return error?.code === "23505" || /duplicate|unique/i.test(error?.message ?? "");
}
