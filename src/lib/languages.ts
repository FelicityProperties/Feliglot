// Every course Feliglot offers. The phrases themselves live in
// public/content/<code>.json (one file per language, keyed by concept id).

export type Region =
  | "Europe"
  | "Middle East & North Africa"
  | "South Asia"
  | "East Asia"
  | "Southeast Asia"
  | "Sub-Saharan Africa"
  | "Central Asia & Caucasus"
  | "Constructed";

export type Language = {
  code: string; // URL slug and content file name
  name: string; // English name
  nativeName: string; // what speakers call it
  speech: string; // BCP 47 tag for the browser's voice; may have no voice on a device
  dir: "ltr" | "rtl";
  // How phrases are written for reading aloud when the script is not Latin.
  // null means the language is written in Latin letters already.
  romanization: string | null;
  region: Region;
  // Extra instructions for whoever writes the phrases (variety, register).
  guide?: string;
  tagline?: string; // shown on the course page for dialect/variant courses
  aliases?: string[]; // other names and spellings people search for
};

export const LANGUAGES: Language[] = [
  // Europe
  { code: "en", name: "English", nativeName: "English", speech: "en-US", dir: "ltr", romanization: null, region: "Europe", guide: "International English; American spelling." },
  { code: "es", name: "Spanish", nativeName: "Español", speech: "es-ES", dir: "ltr", romanization: null, region: "Europe", guide: "Neutral Spanish understood in Spain and Latin America; use usted for polite forms." },
  { code: "fr", name: "French", nativeName: "Français", speech: "fr-FR", dir: "ltr", romanization: null, region: "Europe", guide: "Standard French; use vous for polite forms." },
  { code: "de", name: "German", nativeName: "Deutsch", speech: "de-DE", dir: "ltr", romanization: null, region: "Europe", guide: "Standard German; use Sie for polite forms." },
  { code: "it", name: "Italian", nativeName: "Italiano", speech: "it-IT", dir: "ltr", romanization: null, region: "Europe", guide: "Standard Italian; use Lei for polite forms." },
  { code: "pt", name: "Portuguese (Brazil)", nativeName: "Português", speech: "pt-BR", dir: "ltr", romanization: null, region: "Europe", guide: "Brazilian Portuguese as spoken today; use você / o senhor as natural.", aliases: ["Brazilian", "Português brasileiro"] },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", speech: "nl-NL", dir: "ltr", romanization: null, region: "Europe" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", speech: "sv-SE", dir: "ltr", romanization: null, region: "Europe" },
  { code: "nb", name: "Norwegian", nativeName: "Norsk", speech: "nb-NO", dir: "ltr", romanization: null, region: "Europe", guide: "Norwegian Bokmål.", aliases: ["Bokmål", "Bokmal"] },
  { code: "da", name: "Danish", nativeName: "Dansk", speech: "da-DK", dir: "ltr", romanization: null, region: "Europe" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", speech: "fi-FI", dir: "ltr", romanization: null, region: "Europe" },
  { code: "pl", name: "Polish", nativeName: "Polski", speech: "pl-PL", dir: "ltr", romanization: null, region: "Europe", guide: "Use Pan/Pani polite forms where natural." },
  { code: "cs", name: "Czech", nativeName: "Čeština", speech: "cs-CZ", dir: "ltr", romanization: null, region: "Europe" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", speech: "hu-HU", dir: "ltr", romanization: null, region: "Europe" },
  { code: "ro", name: "Romanian", nativeName: "Română", speech: "ro-RO", dir: "ltr", romanization: null, region: "Europe", guide: "Use correct comma-below ș and ț." },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", speech: "hr-HR", dir: "ltr", romanization: null, region: "Europe" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", speech: "el-GR", dir: "ltr", romanization: "Simple Greek-to-Latin transliteration with the stressed syllable marked by an acute accent (e.g. kaliméra)", region: "Europe", aliases: ["Ellinika"] },
  { code: "ru", name: "Russian", nativeName: "Русский", speech: "ru-RU", dir: "ltr", romanization: "Simple English-friendly transliteration (e.g. spasibo, zdravstvuyte)", region: "Europe", guide: "Use вы for polite forms." },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", speech: "uk-UA", dir: "ltr", romanization: "Simple English-friendly transliteration (e.g. dyakuyu)", region: "Europe" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", speech: "bg-BG", dir: "ltr", romanization: "Simple English-friendly transliteration", region: "Europe" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge", speech: "ga-IE", dir: "ltr", romanization: null, region: "Europe", aliases: ["Gaelic", "Irish Gaelic"] },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg", speech: "cy-GB", dir: "ltr", romanization: null, region: "Europe" },

  // Middle East & North Africa
  { code: "ar", name: "Arabic (Standard)", nativeName: "العربية", speech: "ar-SA", dir: "rtl", romanization: "Simple English-letter transliteration, no special symbols except ' for the ayn (e.g. marhaban, shukran)", region: "Middle East & North Africa", guide: "Modern Standard Arabic (fusha) as used in news and writing. Unvocalised script (no harakat) except where needed to avoid ambiguity.", tagline: "The Arabic of news, books and signs — understood across the Arab world.", aliases: ["Fusha", "Modern Standard Arabic", "الفصحى"] },
  { code: "ar-gulf", name: "Arabic (Gulf)", nativeName: "العربية الخليجية", speech: "ar-AE", dir: "rtl", romanization: "Simple English-letter transliteration that follows Gulf pronunciation (qaf as g, often kaf as ch), ' for the ayn (e.g. shlonak, zain, waayed)", region: "Middle East & North Africa", guide: "Everyday spoken Gulf Arabic as heard in the UAE (Emirati/Gulf), NOT Modern Standard Arabic. Use common Gulf spellings in Arabic script.", tagline: "The everyday Arabic you hear in Dubai, Abu Dhabi and across the Gulf.", aliases: ["Khaleeji", "Emirati", "خليجي"] },
  { code: "ar-eg", name: "Arabic (Egyptian)", nativeName: "العربية المصرية", speech: "ar-EG", dir: "rtl", romanization: "Simple English-letter transliteration that follows Cairo pronunciation (qaf as a glottal stop ', jim as g), ' for the ayn (e.g. ezzayak, shokran)", region: "Middle East & North Africa", guide: "Everyday spoken Egyptian (Cairene) Arabic, NOT Modern Standard Arabic. Use common Egyptian spellings in Arabic script.", tagline: "The Arabic of Cairo — and of most Arabic films, series and songs.", aliases: ["Masri", "مصري"] },
  { code: "he", name: "Hebrew", nativeName: "עברית", speech: "he-IL", dir: "rtl", romanization: "Simple English-letter transliteration (e.g. shalom, toda)", region: "Middle East & North Africa", guide: "Modern Israeli Hebrew, unvocalised (no niqqud)." },
  { code: "fa", name: "Persian", nativeName: "فارسی", speech: "fa-IR", dir: "rtl", romanization: "Simple English-letter transliteration of Tehran pronunciation (e.g. salaam, merci, mamnoon)", region: "Middle East & North Africa", guide: "Iranian Persian (Farsi), polite everyday register.", aliases: ["Farsi", "فارسي"] },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", speech: "tr-TR", dir: "ltr", romanization: null, region: "Middle East & North Africa" },

  // South Asia
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", speech: "hi-IN", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics (e.g. namaste, dhanyavaad, aap kaise hain)", region: "South Asia", guide: "Everyday spoken Hindi (use aap for polite forms); common English loanwords are fine where Hindi speakers actually use them.", aliases: ["हिंदी"] },
  { code: "ur", name: "Urdu", nativeName: "اردو", speech: "ur-PK", dir: "rtl", romanization: "Simple English-letter phonetic spelling without diacritics (e.g. shukriya, aap kaise hain)", region: "South Asia", guide: "Everyday Urdu in Nastaliq/Arabic script; use aap for polite forms." },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", speech: "bn-BD", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics (e.g. dhonnobad)", region: "South Asia", guide: "Standard colloquial Bengali; use apni for polite forms." },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", speech: "pa-IN", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics (e.g. sat sri akaal)", region: "South Asia", guide: "Punjabi in Gurmukhi script.", aliases: ["Panjabi", "پنجابی"] },
  { code: "mr", name: "Marathi", nativeName: "मराठी", speech: "mr-IN", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics", region: "South Asia" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", speech: "gu-IN", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics", region: "South Asia" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speech: "ta-IN", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics (e.g. vanakkam, nandri)", region: "South Asia", guide: "Polite spoken Tamil as used in everyday conversation." },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speech: "te-IN", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics", region: "South Asia" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", speech: "ml-IN", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics (e.g. namaskaram, nanni)", region: "South Asia" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", speech: "ne-NP", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics", region: "South Asia" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල", speech: "si-LK", dir: "ltr", romanization: "Simple English-letter phonetic spelling without diacritics (e.g. ayubowan, stuti)", region: "South Asia" },
  { code: "ps", name: "Pashto", nativeName: "پښتو", speech: "ps-AF", dir: "rtl", romanization: "Simple English-letter phonetic spelling without diacritics", region: "South Asia" },

  // East Asia
  { code: "zh", name: "Chinese (Mandarin)", nativeName: "中文", speech: "zh-CN", dir: "ltr", romanization: "Hanyu Pinyin with tone marks, words separated by spaces (e.g. nǐ hǎo, xièxie)", region: "East Asia", guide: "Mandarin in Simplified characters.", aliases: ["普通话", "汉语", "國語", "Putonghua", "Mandarin"] },
  { code: "yue", name: "Cantonese", nativeName: "粵語", speech: "zh-HK", dir: "ltr", romanization: "Jyutping with tone numbers (e.g. nei5 hou2, m4 goi1)", region: "East Asia", guide: "Colloquial spoken Hong Kong Cantonese in Traditional characters, using Cantonese-specific characters (e.g. 唔, 係, 嘅) — NOT Mandarin written in Traditional characters.", aliases: ["粤语", "廣東話", "广东话", "Yue"] },
  { code: "ja", name: "Japanese", nativeName: "日本語", speech: "ja-JP", dir: "ltr", romanization: "Modified Hepburn with long vowels marked by macrons (e.g. arigatō gozaimasu, konnichiwa)", region: "East Asia", guide: "Polite (desu/masu) Japanese in normal kanji and kana." },
  { code: "ko", name: "Korean", nativeName: "한국어", speech: "ko-KR", dir: "ltr", romanization: "Revised Romanization (e.g. annyeonghaseyo, gamsahamnida)", region: "East Asia", guide: "Polite -yo / formal -mnida speech as natural in each phrase." },

  // Southeast Asia
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", speech: "vi-VN", dir: "ltr", romanization: null, region: "Southeast Asia", guide: "Standard Vietnamese with full tone marks; choose natural polite pronouns." },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย", speech: "th-TH", dir: "ltr", romanization: "Simple English-friendly phonetic spelling (e.g. sawatdee khrap, khop khun khrap)", region: "Southeast Asia", guide: "Polite Thai. Use the male polite particle ครับ (khrap) in text and give the female ค่ะ/คะ (kha) version in the note." },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", speech: "id-ID", dir: "ltr", romanization: null, region: "Southeast Asia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", speech: "ms-MY", dir: "ltr", romanization: null, region: "Southeast Asia", guide: "Malaysian Malay.", aliases: ["Bahasa Malaysia"] },
  { code: "fil", name: "Filipino (Tagalog)", nativeName: "Filipino", speech: "fil-PH", dir: "ltr", romanization: null, region: "Southeast Asia", guide: "Everyday Filipino/Tagalog; use po/opo for polite forms where natural.", aliases: ["Tagalog", "Pilipino"] },

  // Sub-Saharan Africa
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", speech: "sw-KE", dir: "ltr", romanization: null, region: "Sub-Saharan Africa", aliases: ["Kiswahili"] },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", speech: "am-ET", dir: "ltr", romanization: "Simple English-letter phonetic spelling (e.g. selam, ameseginalehu)", region: "Sub-Saharan Africa" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá", speech: "yo-NG", dir: "ltr", romanization: null, region: "Sub-Saharan Africa", guide: "Standard Yoruba with tone marks and under-dots." },
  { code: "ha", name: "Hausa", nativeName: "Hausa", speech: "ha-NG", dir: "ltr", romanization: null, region: "Sub-Saharan Africa", guide: "Standard Hausa in Latin script (boko), with hooked letters ɓ ɗ ƙ where required." },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", speech: "zu-ZA", dir: "ltr", romanization: null, region: "Sub-Saharan Africa" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", speech: "af-ZA", dir: "ltr", romanization: null, region: "Sub-Saharan Africa" },
  { code: "so", name: "Somali", nativeName: "Soomaali", speech: "so-SO", dir: "ltr", romanization: null, region: "Sub-Saharan Africa" },

  // Central Asia & Caucasus
  { code: "ka", name: "Georgian", nativeName: "ქართული", speech: "ka-GE", dir: "ltr", romanization: "Simple English-friendly transliteration (e.g. gamarjoba, madloba)", region: "Central Asia & Caucasus" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն", speech: "hy-AM", dir: "ltr", romanization: "Simple English-friendly transliteration (e.g. barev, shnorhakalutyun)", region: "Central Asia & Caucasus", guide: "Eastern Armenian." },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі", speech: "kk-KZ", dir: "ltr", romanization: "Simple English-friendly transliteration (e.g. salemetsiz be, rakhmet)", region: "Central Asia & Caucasus", guide: "Kazakh in Cyrillic script." },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbekcha", speech: "uz-UZ", dir: "ltr", romanization: null, region: "Central Asia & Caucasus", guide: "Uzbek in the official Latin script (use ʻ in oʻ and gʻ).", aliases: ["Ozbek", "Ўзбекча"] },

  // Constructed
  { code: "eo", name: "Esperanto", nativeName: "Esperanto", speech: "eo", dir: "ltr", romanization: null, region: "Constructed" },
];

export const REGIONS: Region[] = [
  "Europe",
  "Middle East & North Africa",
  "South Asia",
  "East Asia",
  "Southeast Asia",
  "Sub-Saharan Africa",
  "Central Asia & Caucasus",
  "Constructed",
];

// Alphabetical by English name, with a fixed collation so the server and
// every browser produce the same order (a locale-dependent sort breaks hydration).
const byName = new Intl.Collator("en");
export const LANGUAGES_BY_NAME: Language[] = [...LANGUAGES].sort((a, b) => byName.compare(a.name, b.name));

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
