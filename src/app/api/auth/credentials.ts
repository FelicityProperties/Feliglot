// Validates the email + password sent by the sign-up and log-in forms.
// (Not a route: files other than route.ts in app/ are not served.)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function readCredentials(req: Request): Promise<{ email: string; password: string } | { error: string }> {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return { error: "Bad request." };
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!EMAIL.test(email) || email.length > 254) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (password.length > 200) return { error: "That password is too long." };
  return { email, password };
}
