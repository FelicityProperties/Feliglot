// Feli, the Feliglot cat (design from the Lovable reference). Flat shapes in
// theme colours, so she follows light/dark mode and works as the app icon.
export type Mood = "happy" | "cheer" | "think" | "sad" | "sleep";

const LABEL: Record<Mood, string> = {
  happy: "Feli the cat, smiling",
  cheer: "Feli the cat, cheering",
  think: "Feli the cat, thinking",
  sad: "Feli the cat, looking sorry",
  sleep: "Feli the cat, asleep",
};

export default function Feli({
  mood = "happy",
  size = 96,
  className = "",
  decorative = false,
}: {
  mood?: Mood;
  size?: number;
  className?: string;
  decorative?: boolean;
}) {
  const cheer = mood === "cheer";
  const sleep = mood === "sleep";
  const think = mood === "think";
  const sad = mood === "sad";
  const ink = "var(--feli-dark)";
  return (
    <svg
      viewBox="0 0 180 190"
      width={size}
      height={(size * 190) / 180}
      className={className}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": LABEL[mood] })}
    >
      {cheer && (
        <g className="animate-sparkle" fill="var(--celebration)">
          <path d="m22 38 4 9 9 4-9 4-4 9-4-9-9-4 9-4z" />
          <path d="m153 26 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
          <circle cx="145" cy="72" r="4" />
        </g>
      )}
      <path d={cheer ? "M53 135C35 128 27 113 30 96" : "M52 136C35 141 25 132 27 119"} fill="none" stroke={ink} strokeWidth="11" strokeLinecap="round" />
      <path
        d={cheer ? "M127 135c18-7 26-22 23-39" : think ? "M128 135c17 2 24-11 20-22" : "M128 136c17 5 27-4 26-18"}
        fill="none"
        stroke={ink}
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path d="M48 73 48 35l25 21M132 73V35l-25 21" fill="var(--feli)" stroke={ink} strokeWidth="7" strokeLinejoin="round" />
      <path d="m53 44 13 11H53zM127 44l-13 11h13z" fill="var(--feli-ear)" />
      <rect x="42" y="51" width="96" height="109" rx="47" fill="var(--feli)" stroke={ink} strokeWidth="7" />
      {cheer ? (
        <>
          <path d="M67 91q8-9 16 0M98 91q8-9 16 0" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
          <path d="M77 110q13 16 27 0" fill="var(--celebration-soft)" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : sleep ? (
        <>
          <path d="M63 92h18M100 92h18" stroke={ink} strokeWidth="6" strokeLinecap="round" />
          <path d="M83 113q7 5 14 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          <text x="138" y="54" fill="var(--primary)" fontSize="23" fontWeight="800">
            z
          </text>
          <text x="154" y="35" fill="var(--primary)" fontSize="16" fontWeight="800">
            z
          </text>
        </>
      ) : (
        <>
          <circle cx="73" cy="91" r="6" fill={ink} />
          <circle cx="107" cy="91" r="6" fill={ink} />
          <path d="m86 103 4 4 4-4" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          {sad ? (
            <path d="M80 120q10-9 20 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          ) : think ? (
            <>
              <path d="M82 116q8 4 16 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
              <circle cx="143" cy="93" r="6" fill="var(--primary-soft)" />
              <circle cx="157" cy="78" r="9" fill="var(--primary-soft)" />
            </>
          ) : (
            <path d="M78 113q12 14 24 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          )}
        </>
      )}
      <path d="M68 156v19M112 156v19" stroke={ink} strokeWidth="10" strokeLinecap="round" />
      {cheer && <path d="M54 137 29 105M126 137l25-32" stroke={ink} strokeWidth="10" strokeLinecap="round" />}
    </svg>
  );
}
