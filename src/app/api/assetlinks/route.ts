// Served at /.well-known/assetlinks.json (see next.config.ts). It proves to
// Android that the Play Store app (a Trusted Web Activity wrapping this site)
// and the website belong together, so the app opens full-screen without a
// browser bar. Set ANDROID_PACKAGE_NAME and ANDROID_SHA256_FINGERPRINTS
// (comma-separated, from Play Console → App integrity) in Vercel.
export const dynamic = "force-dynamic";

export function GET() {
  const pkg = process.env.ANDROID_PACKAGE_NAME;
  const prints = (process.env.ANDROID_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const body =
    pkg && prints.length
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: prints },
          },
        ]
      : [];
  return Response.json(body, { headers: { "cache-control": "public, max-age=3600" } });
}
