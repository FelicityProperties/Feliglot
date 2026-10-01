import type { Metadata } from "next";
import ReviewHub from "@/components/ReviewHub";
import T from "@/components/T";

export const metadata: Metadata = {
  title: "Review",
  description: "Phrases you've learned come back just before you'd forget them.",
};

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        <T k="lesson.review.title" />
      </h1>
      <p className="mt-2 mb-6 text-ink-600">
        <T k="lesson.review.intro" />
      </p>
      <ReviewHub />
    </div>
  );
}
