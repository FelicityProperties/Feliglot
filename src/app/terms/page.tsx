import type { Metadata } from "next";
import Prose from "@/components/Prose";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <Prose>
      <p className="eyebrow">Last updated 1 October 2026</p>
      <h1>Terms of use</h1>
      <p>Feliglot is a free service from Felicity. By using it you agree to these simple terms.</p>
      <h2>Using Feliglot</h2>
      <ul>
        <li>Use it to learn. Don&apos;t try to break, overload or misuse the site, its AI translator or other people&apos;s accounts.</li>
        <li>Keep your password to yourself. You&apos;re responsible for what happens in your account.</li>
        <li>You can delete your account at any time from your account page.</li>
      </ul>
      <h2>Content</h2>
      <ul>
        <li>
          Course phrases were written and checked with the help of AI and are being reviewed by native speakers. AI translations
          can contain mistakes. Don&apos;t rely on Feliglot for medical, legal or safety-critical communication.
        </li>
        <li>Feliglot&apos;s design, Feli the cat and the course content belong to Felicity.</li>
      </ul>
      <h2>The service</h2>
      <p>
        We work hard to keep Feliglot available and your progress safe, but it&apos;s provided as is, and we may change or stop
        features. We&apos;re not liable for indirect losses from using it, as far as the law allows.
      </p>
      <h2>Changes</h2>
      <p>If these terms change, we&apos;ll update this page and the date above.</p>
    </Prose>
  );
}
