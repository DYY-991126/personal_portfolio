/**
 * Trim secrets from env / .env files: BOM, whitespace, accidental wrapping quotes.
 */
export function normalizeEnvSecret(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  let v = value.replace(/^\ufeff/, "").trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v.length > 0 ? v : undefined;
}
