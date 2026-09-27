// Everyday Gulf (UAE) Arabic, as spoken in Dubai — not formal textbook Arabic.
// Transliteration uses plain English letters so no one needs to learn a
// system first. Gulf speech turns a written ق into "g" and often ك into "ch";
// the transliteration follows the speech, the Arabic follows common spelling.
//
// Content status: drafted, awaiting review by a native Emirati speaker.
// Do not remove the review notice on the site until that review is done.

export type Phrase = {
  ar: string; // Arabic script
  say: string; // how to say it
  en: string; // meaning in English
  note?: string; // usage tip
};

export type Lesson = {
  slug: string;
  title: string;
  blurb: string;
  emoji: string;
  phrases: Phrase[];
};

export const LESSONS: Lesson[] = [
  {
    slug: "greetings",
    title: "Hello & goodbye",
    blurb: "The first thirty seconds of every conversation.",
    emoji: "👋",
    phrases: [
      { ar: "السلام عليكم", say: "as-salaamu 'alaykum", en: "Hello (peace be upon you)", note: "The safe greeting for anyone, anywhere." },
      { ar: "وعليكم السلام", say: "wa 'alaykum is-salaam", en: "Hello back (the reply)" },
      { ar: "مرحبا", say: "marhaba", en: "Hi" },
      { ar: "هلا", say: "hala", en: "Hey / welcome", note: "Warm and casual. \"Hala wallah\" is extra friendly." },
      { ar: "شلونك؟", say: "shlonak?", en: "How are you? (to a man)" },
      { ar: "شلونج؟", say: "shlonich?", en: "How are you? (to a woman)" },
      { ar: "زين، الحمد لله", say: "zain, il-hamdu lillah", en: "Good, thank God", note: "The standard answer, even on a bad day." },
      { ar: "صباح الخير", say: "sabaah il-khair", en: "Good morning" },
      { ar: "صباح النور", say: "sabaah in-noor", en: "Good morning (the reply)" },
      { ar: "مساء الخير", say: "masaa il-khair", en: "Good evening" },
      { ar: "مع السلامة", say: "ma'a is-salaama", en: "Goodbye" },
    ],
  },
  {
    slug: "everyday",
    title: "Words you hear all day",
    blurb: "Small words that carry half of every conversation.",
    emoji: "💬",
    phrases: [
      { ar: "شكرا", say: "shukran", en: "Thank you" },
      { ar: "عفوا", say: "'afwan", en: "You're welcome / excuse me" },
      { ar: "يلا", say: "yalla", en: "Let's go / come on" },
      { ar: "خلاص", say: "khalaas", en: "Done / that's enough" },
      { ar: "إن شاء الله", say: "inshallah", en: "God willing / hopefully" },
      { ar: "ما شاء الله", say: "mashallah", en: "Wonderful (said to admire something)" },
      { ar: "إيه", say: "ee", en: "Yes", note: "Gulf speakers say \"ee\" far more than the formal \"na'am\"." },
      { ar: "لا", say: "la", en: "No" },
      { ar: "مب", say: "mub", en: "Not", note: "Emirati. \"Mub zain\" = not good." },
      { ar: "واجد", say: "waayed", en: "A lot / very" },
      { ar: "شوي", say: "shway", en: "A little" },
      { ar: "الحين", say: "il-heen", en: "Now" },
      { ar: "باجر", say: "baachir", en: "Tomorrow" },
      { ar: "تمام", say: "tamaam", en: "Perfect / OK" },
    ],
  },
  {
    slug: "questions",
    title: "Asking questions",
    blurb: "Where, what, how much — enough to get anything done.",
    emoji: "❓",
    phrases: [
      { ar: "وين؟", say: "wain?", en: "Where?" },
      { ar: "شو؟", say: "shu?", en: "What?" },
      { ar: "ليش؟", say: "laish?", en: "Why?" },
      { ar: "متى؟", say: "mita?", en: "When?" },
      { ar: "منو؟", say: "minu?", en: "Who?" },
      { ar: "كم؟", say: "cham?", en: "How much? / How many?" },
      { ar: "أبغي", say: "abgha", en: "I want" },
      { ar: "ممكن؟", say: "mumkin?", en: "Is it possible? / Can I?" },
      { ar: "ما فهمت", say: "ma fehamt", en: "I didn't understand" },
      { ar: "شوي شوي لو سمحت", say: "shway shway law samaht", en: "Slowly, please" },
    ],
  },
  {
    slug: "taxi",
    title: "Getting around",
    blurb: "Directions for taxis, drivers and valet.",
    emoji: "🚕",
    phrases: [
      { ar: "أبغي أروح ...", say: "abgha arooh ...", en: "I want to go to ..." },
      { ar: "سيدا", say: "seeda", en: "Straight ahead", note: "Everyday UAE word, borrowed from Hindi/Urdu." },
      { ar: "على اليمين", say: "'ala il-yimeen", en: "To the right" },
      { ar: "على اليسار", say: "'ala il-yisaar", en: "To the left" },
      { ar: "وقف هني", say: "waggif hni", en: "Stop here" },
      { ar: "قريب", say: "gareeb", en: "Near" },
      { ar: "بعيد", say: "ba'eed", en: "Far" },
      { ar: "بسرعة", say: "bsur'a", en: "Quickly" },
    ],
  },
  {
    slug: "shopping",
    title: "Shops & money",
    blurb: "Prices, paying and a little bargaining.",
    emoji: "🛍️",
    phrases: [
      { ar: "بكم هذا؟", say: "bi-cham haadha?", en: "How much is this?" },
      { ar: "غالي", say: "ghaali", en: "Expensive" },
      { ar: "رخيص", say: "rakhees", en: "Cheap" },
      { ar: "في خصم؟", say: "fee khasm?", en: "Is there a discount?" },
      { ar: "الحساب لو سمحت", say: "il-hsaab law samaht", en: "The bill, please" },
      { ar: "كاش ولا بطاقة؟", say: "kaash walla bitaaga?", en: "Cash or card?" },
      { ar: "درهم", say: "dirham", en: "Dirham" },
    ],
  },
  {
    slug: "home",
    title: "Home & building",
    blurb: "For your flat, your landlord and the building team.",
    emoji: "🏠",
    phrases: [
      { ar: "الشقة", say: "ish-shigga", en: "The apartment" },
      { ar: "البيت", say: "il-bait", en: "The house / home" },
      { ar: "الإيجار", say: "il-eejaar", en: "The rent" },
      { ar: "عقد الإيجار", say: "'agd il-eejaar", en: "The tenancy contract" },
      { ar: "المالك", say: "il-maalik", en: "The owner / landlord" },
      { ar: "المفتاح", say: "il-miftaah", en: "The key" },
      { ar: "المكيف خربان", say: "il-mukayyif kharbaan", en: "The AC is broken", note: "The most useful sentence in Dubai in August." },
      { ar: "الماي", say: "il-maay", en: "The water" },
      { ar: "الجيران", say: "il-jeeraan", en: "The neighbours" },
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export const ALL_PHRASES: (Phrase & { lesson: string; lessonSlug: string })[] =
  LESSONS.flatMap((l) =>
    l.phrases.map((p) => ({ ...p, lesson: l.title, lessonSlug: l.slug })),
  );
