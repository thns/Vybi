// Admin designation is driven by the ADMIN_EMAILS env var (comma-separated,
// case-insensitive) rather than a DB column. This keeps the check edge-safe
// (no DB in middleware), works before an account row exists, and is managed
// with one env var in Netlify. Example:
//   ADMIN_EMAILS=pandahealthcare@gmail.com,ops@vybi.bio
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
