"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { useAccount } from "@/lib/store";

// Shown after a passed lesson to learners who aren't signed in.
export default function SavePrompt() {
  const account = useAccount();
  const { t } = useT();
  if (account.status !== "signed-out") return null;
  // The link goes where "{link}" sits in the sentence, so word order follows the language.
  return (
    <p className="mt-4 text-sm text-ink-600">
      {t("lesson.save.text")
        .split("{link}")
        .map((part, j) => (
          <Fragment key={j}>
            {j > 0 && (
              <Link href="/account" className="font-medium text-teal-700 underline">
                {t("lesson.save.link")}
              </Link>
            )}
            {part}
          </Fragment>
        ))}
    </p>
  );
}
