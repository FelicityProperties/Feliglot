import type { Metadata } from "next";
import AccountPanel from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Your account",
  description: "Save your Feliglot progress and keep learning on any device.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your account</h1>
      <AccountPanel />
    </div>
  );
}
