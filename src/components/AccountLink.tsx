"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAccount } from "@/lib/store";

// Header link: "Sign in", or the signed-in learner's avatar.
export default function AccountLink() {
  const account = useAccount();
  if (account.status === "loading") return null;
  if (account.status === "signed-in") {
    return (
      <Link href="/account" className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-sand-300 bg-primary-soft text-primary" aria-label="Your account">
        {account.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={account.avatar} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display font-black">{Array.from(account.name ?? account.email)[0].toUpperCase()}</span>
        )}
      </Link>
    );
  }
  return (
    <Link href="/account" className="inline-flex items-center gap-1.5 font-display font-extrabold text-primary">
      <UserRound size={18} aria-hidden /> {account.status === "off" ? "Progress" : "Sign in"}
    </Link>
  );
}
