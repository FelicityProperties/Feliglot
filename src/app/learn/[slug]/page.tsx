import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonPlayer from "@/components/LessonPlayer";
import { LESSONS, getLesson } from "@/lib/lessons";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return { title: lesson ? `${lesson.title} — Feliglot` : "Feliglot" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const next = LESSONS[LESSONS.indexOf(lesson) + 1];

  return (
    <div>
      <Link href="/learn" className="text-sm text-ink-500 hover:text-teal-700">
        ← All lessons
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        <span aria-hidden>{lesson.emoji}</span> {lesson.title}
      </h1>
      <p className="mt-2 mb-8 text-ink-600">{lesson.blurb}</p>
      <LessonPlayer lesson={lesson} next={next} />
    </div>
  );
}
