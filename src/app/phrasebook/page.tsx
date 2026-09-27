import type { Metadata } from "next";
import Phrasebook from "@/components/Phrasebook";

export const metadata: Metadata = { title: "Phrasebook — Feliglot" };

export default function PhrasebookPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Phrasebook</h1>
      <p className="mt-2 mb-6 text-ink-600">Type what you want to say in English and find the Dubai way to say it.</p>
      <Phrasebook />
    </div>
  );
}
