"use client";

import { useEffect } from "react";
import { getLanguage } from "@/lib/languages";
import { useSpeakLanguage } from "@/lib/store";

// Keeps <html lang> and the page direction in step with the language the
// learner picked, so screen readers use the right voice and Arabic, Hebrew,
// Persian and Urdu read right to left.
export default function HtmlLang() {
  const code = useSpeakLanguage();
  useEffect(() => {
    const l = getLanguage(code);
    document.documentElement.lang = l?.speech ?? "en";
    document.documentElement.dir = l?.dir ?? "ltr";
  }, [code]);
  return null;
}
