// Readable long-form text (privacy policy, terms).
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl space-y-4 leading-relaxed text-ink-700 [&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-ink-900 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-ink-900 [&_li]:ms-5 [&_li]:list-disc [&_a]:font-bold [&_a]:text-primary [&_a]:underline">
      {children}
    </article>
  );
}
