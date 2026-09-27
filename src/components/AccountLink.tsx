"use client";

import Link from "next/link";
import { useAccount } from "@/lib/store";

// Header link: "Sign in" or the signed-in learner's account.
export default function AccountLink() {
  const account = useAccount();
  if (account.status === "off" || account.status === "loading") return null;
  return (
    <Link href="/account" className="hover:text-teal-700">
      {account.status === "signed-in" ? (
        <>
          <span aria-hidden>👤</span> <span className="sr-only">Your account</span>
          <span className="hidden sm:inline">Account</span>
        </>
      ) : (
        "Sign in"
      )}
    </Link>
  );
}
