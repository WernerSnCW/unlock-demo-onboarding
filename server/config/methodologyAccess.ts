/**
 * v1 access control for the methodology explainer: a plain allowlist of
 * investor session tokens, not a DB column. The `/i/:token` session table
 * needs a real Postgres connection this environment doesn't have locally,
 * and the only intended reader today is Tony — a DB migration is not
 * justified yet. Swap this for a real column when a second investor needs
 * the toggle. Populate via the METHODOLOGY_ENABLED_TOKENS env var
 * (comma-separated) so no token is hard-coded into source control.
 */
function loadAllowlist(): Set<string> {
  const raw = process.env.METHODOLOGY_ENABLED_TOKENS || '';
  return new Set(raw.split(',').map((t) => t.trim()).filter(Boolean));
}

export function isMethodologyEnabled(token: string | undefined): boolean {
  if (!token) return false;
  return loadAllowlist().has(token);
}
