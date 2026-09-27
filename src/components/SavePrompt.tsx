"use client";

import Link from "next/link";
import { useAccount } from "@/lib/store";

// Shown after a passed lesson to learners who aren't signed in.
export default function SavePrompt() {
  const account = useAccount();
  if (account.status !== "signed-out") return null;
  return (
    <p className="mt-4 text-sm text-ink-600">
      <Link href="/account" className="font-medium text-teal-700 underline">
        Create a free account
      </Link>{" "}
      to keep your progress on any device.
    </p>
  );
}
