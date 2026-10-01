import type { Metadata } from "next";
import Prose from "@/components/Prose";

export const metadata: Metadata = { title: "Privacy policy", description: "What Feliglot collects, why, and how to delete it." };

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const UPDATED = "1 October 2026";

export default function PrivacyPage() {
  return (
    <Prose>
      <p className="eyebrow">Last updated {UPDATED}</p>
      <h1>Privacy policy</h1>
      <p>
        Feliglot is a free language-learning app made by Felicity. We collect as little as we can, never sell your data, and
        never show ads. This page explains exactly what we keep.
      </p>

      <h2>Everyone, with or without an account</h2>
      <ul>
        <li>
          Your progress itself (which lessons and phrases you&apos;ve learned, your points, streak, daily goal and the language
          you speak) stays in your own browser. We only receive it if you create an account (see below).
        </li>
        <li>
          We count visits anonymously: the page you opened, the name of the site you came from, your country and your device
          type (phone, tablet or computer).
        </li>
        <li>
          We also count a few learning moments anonymously, so we can see what helps people learn: when you pass a lesson
          (the language, the lesson and your score), finish a review (how many phrases), set a daily goal, install the app, or
          use AI translation (the language you translated into). The text you translate is not part of this.
        </li>
        <li>
          None of this is linked to you or to your account, even when you&apos;re signed in. To count how many different
          people visit each day, we turn your connection details (your IP address and browser) into a code using a secret key
          that is made new every day. Each day&apos;s key is thrown away after two days, so after that nobody, including us,
          can work out the code again or connect your visits from one day to the next. We don&apos;t keep your IP address,
          and we set no cookies for counting.
        </li>
        <li>Our host, Vercel, also counts anonymous page views to show us overall traffic. It sets no cookies either.</li>
        <li>
          If your browser sends &ldquo;Do Not Track&rdquo; or &ldquo;Global Privacy Control&rdquo;, we don&apos;t count your
          visits or learning moments at all, and neither does Vercel&apos;s page-view counter.
        </li>
      </ul>

      <h2>With an account</h2>
      <ul>
        <li>Your email address, your name if you give one, and a securely scrambled version of your password (never the password itself).</li>
        <li>
          If you sign in with Google: your name, email address and profile picture from Google, and your Google account ID (a
          number Google gives your account, so we recognise you next time). We never see your Google password. If you sign in
          with Google using the email of an account you already have, the two are joined and the old password is deleted:
          from then on, you sign in with Google.
        </li>
        <li>Your learning progress, so it follows you to every device, and the country you signed up from.</li>
        <li>When you were last active.</li>
        <li>A sign-in cookie that keeps you logged in. It is used for nothing else.</li>
      </ul>

      <h2>Speaking and translating</h2>
      <ul>
        <li>
          &ldquo;Listen&rdquo; and &ldquo;Say it&rdquo; use your device&apos;s and browser&apos;s own speech features. Depending on
          your browser, your voice may be processed by your browser&apos;s maker (for example Google or Apple) to turn it into
          text. Feliglot never records or stores your voice.
        </li>
        <li>
          If you use &ldquo;Translate &amp; explain&rdquo;, the text you type is sent to Anthropic, our AI provider, to produce the
          translation. Don&apos;t type personal information there.
        </li>
      </ul>

      <h2>Who can see it</h2>
      <p>
        Only Felicity, to run and improve Feliglot. Our providers (Vercel for hosting, Neon for the database, Anthropic for AI
        translation, Google for sign-in) handle data only to provide their service to us.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Your account and progress: until you delete your account.</li>
        <li>Anonymous visit and learning counts: up to 13 months, then deleted.</li>
        <li>The daily keys used to count visitors: two days, then deleted.</li>
      </ul>

      <h2>Deleting your data</h2>
      <p>
        Open <a href="/account">your account</a> and choose &ldquo;Delete my account&rdquo;. Your account, progress and sign-ins
        are deleted immediately and permanently. The anonymous counts were never linked to you, so there is nothing in them to
        trace back to you; they are deleted after 13 months like everyone else&apos;s.
      </p>

      <h2>Children</h2>
      <p>Feliglot is for everyone, but accounts are meant for people aged 13 and over.</p>

      <h2>Questions</h2>
      <p>
        {CONTACT ? (
          <>
            Write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </>
        ) : (
          "Contact Felicity through the details on our app store listing."
        )}
      </p>
    </Prose>
  );
}
