// The owner dashboard is open only to the emails listed in ADMIN_EMAILS
// (comma-separated), set in Vercel → Settings → Environment Variables — and
// only once Google has confirmed the address. Anyone can type any email into
// the sign-up form (nothing checks it), so an email + password account never
// counts, even with the owner's address.
const ADMINS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export type AdminCandidate = { email: string | null | undefined; google_sub: string | null | undefined };

// The email is on the owner list (it may still be unconfirmed).
export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMINS.has(email.toLowerCase()));
}

// The email is on the owner list AND the account signs in with Google, which
// verified the address when the account was created or linked.
export function isAdmin(user: AdminCandidate | null | undefined): boolean {
  return Boolean(user && user.google_sub && isAdminEmail(user.email));
}
