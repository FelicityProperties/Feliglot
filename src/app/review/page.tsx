import type { Metadata } from "next";
import ReviewHub from "@/components/ReviewHub";

export const metadata: Metadata = {
  title: "Review",
  description: "Phrases you've learned come back just before you'd forget them.",
};

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Review</h1>
      <p className="mt-2 mb-6 text-ink-600">
        Phrases you&apos;ve learned come back just before you&apos;d forget them. A few minutes a day keeps them for good.
      </p>
      <ReviewHub />
    </div>
  );
}
