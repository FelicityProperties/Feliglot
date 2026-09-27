import type { Metadata } from "next";
import LessonGrid from "@/components/LessonGrid";

export const metadata: Metadata = { title: "Lessons — Feliglot" };

export default function LearnPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
      <p className="mt-2 text-ink-600">Five minutes each. Learn, practise, then pass a short quiz.</p>
      <div className="mt-8">
        <LessonGrid />
      </div>
    </div>
  );
}
