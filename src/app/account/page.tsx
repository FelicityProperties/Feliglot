import type { Metadata } from "next";
import { Suspense } from "react";
import AccountPanel from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Your account",
  description: "Sign in to save your Feliglot progress and keep learning on any device.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<p className="text-ink-600">Loading…</p>}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}
