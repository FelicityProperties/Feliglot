"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, Check, Flame, Star, Target, Trophy } from "lucide-react";
import { badges } from "@/lib/achievements";
import { UNITS } from "@/lib/curriculum";
import { getLanguage } from "@/lib/languages";
import { GOALS, addDays } from "@/lib/progress";
import { bestStreak, deleteAccount, logIn, logOut, setGoal, signUp, streak, useAccount, useProgress, useToday, type Account } from "@/lib/store";
import { track } from "@/lib/track";
import Feli from "./Feli";

export default function AccountPanel() {
  const account = useAccount();
  if (account.status === "loading") return <p className="text-ink-600">Loading…</p>;
  if (account.status === "off") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black">Your progress</h1>
          <p className="mt-2 text-ink-600">Accounts aren&apos;t switched on yet. Your progress is saved on this device.</p>
        </div>
        <Profile account={null} />
      </div>
    );
  }
  if (account.status === "signed-out") return <SignIn google={account.google} />;
  return <Profile account={account} />;
}

// ---------------------------------------------------------------------------

function SignIn({ google }: { google: boolean }) {
  const params = useSearchParams();
  const progress = useProgress();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "google" ? "Google sign-in didn't work this time — please try again, or use your email." : null,
  );
  const lessons = Object.values(progress.done).reduce((n, u) => n + u.length, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = mode === "signup" ? await signUp(email, password, name) : await logIn(email, password);
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Something went wrong.");
    else setPassword("");
  }

  return (
    <div className="-mx-4 -mt-6 grid overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-3xl sm:border sm:border-sand-300 lg:grid-cols-2">
      <section className="flex flex-col justify-between gap-6 bg-primary p-8 text-on-primary sm:p-12">
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] uppercase">{mode === "signup" ? "Free forever" : "Welcome back"}</p>
          <h1 className="mt-3 text-4xl leading-none font-black sm:text-5xl">
            Your next five minutes
            <br />
            start here.
          </h1>
          <p className="mt-3 opacity-90">
            {lessons > 0
              ? `Save your ${lessons} ${lessons === 1 ? "lesson" : "lessons"} and ${progress.xp} points, and keep learning on any device.`
              : "Feli keeps your place: streak, points and every phrase you've learned, on every device."}
          </p>
        </div>
        <Feli size={180} className="self-center" decorative />
      </section>

      <section className="bg-background p-6 sm:p-10">
        <div className="mx-auto grid max-w-md gap-4">
          <div className="flex gap-2 rounded-2xl bg-sand-100 p-1" role="group" aria-label="Create an account or log in">
            {(
              [
                ["signup", "Create account"],
                ["login", "Log in"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                aria-pressed={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 rounded-xl py-2.5 font-display font-extrabold ${mode === m ? "bg-card text-primary shadow-soft" : "text-ink-600"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {google && (
            <>
              <a href="/api/auth/google?returnTo=/account" className="btn-secondary w-full">
                <GoogleLogo /> Continue with Google
              </a>
              <div className="flex items-center gap-3 text-xs text-ink-500">
                <span className="h-px flex-1 bg-sand-300" /> or with email <span className="h-px flex-1 bg-sand-300" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="grid gap-4">
            {mode === "signup" && (
              <Field id="name" label="First name (optional)">
                <input id="name" autoComplete="given-name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </Field>
            )}
            <Field id="email" label="Email">
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </Field>
            <Field id="password" label="Password" hint="At least 8 characters.">
              <input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-hint"
                className="input"
              />
            </Field>
            {error && (
              <p role="alert" className="rounded-xl bg-danger-soft p-3 text-danger">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">
              {busy ? "One moment…" : mode === "signup" ? "Create account" : "Log in"} <ArrowRight size={18} aria-hidden />
            </button>
          </form>
          <p className="text-center text-xs text-ink-500">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink-700">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------

type SignedIn = Extract<Account, { status: "signed-in" }>;

function Profile({ account }: { account: SignedIn | null }) {
  const progress = useProgress();
  const today = useToday();
  const params = useSearchParams();
  const days = streak(progress.days);
  const best = bestStreak(progress.days);
  const lessons = Object.values(progress.done).reduce((n, u) => n + u.length, 0);
  const courses = Object.entries(progress.done).filter(([code, u]) => u.length > 0 && getLanguage(code));
  const earned = badges(progress, best);
  const joined = account?.joined ? new Date(account.joined).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null;

  // 13 weeks of activity, oldest first, levelled against the daily goal.
  const heat = today
    ? Array.from({ length: 91 }, (_, i) => {
        const d = addDays(today, i - 90);
        const xp = progress.xpDays[d] ?? 0;
        const level = xp === 0 ? (progress.days.includes(d) ? 1 : 0) : xp >= progress.goal ? 4 : xp >= progress.goal / 2 ? 3 : xp >= 20 ? 2 : 1;
        return { d, xp, level };
      })
    : [];

  return (
    <div className="space-y-6">
      {params.get("welcome") && account && (
        <p role="status" className="rounded-2xl bg-success-soft p-4 font-bold text-success">
          Welcome to Feliglot{account.name ? `, ${account.name}` : ""}! Your progress now saves to your account.
        </p>
      )}

      {account && (
        <section className="grid items-center gap-4 border-b border-sand-300 pb-6 sm:grid-cols-[auto_1fr_auto]">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-3xl bg-primary-soft">
            {account.avatar ? (
              // Google profile photos are served by Google; next/image would need its domain allow-listed.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={account.avatar} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              <Feli size={76} decorative />
            )}
          </div>
          <div className="min-w-0">
            <p className="eyebrow">Learner profile</p>
            <h1 className="truncate text-3xl font-black">{account.name ?? account.email.split("@")[0]}</h1>
            <p className="truncate text-sm text-ink-500">
              {account.email}
              {joined ? ` · learning since ${joined}` : ""} · {courses.length} {courses.length === 1 ? "course" : "courses"}
            </p>
          </div>
          <p className="text-sm text-ink-600" role="status">
            {account.saving ? "Saving…" : account.saveFailed ? "Couldn't save just now — we'll retry." : "✓ Synced to your account"}
          </p>
        </section>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [Star, progress.xp.toLocaleString("en-US"), "total points"],
          [Trophy, String(lessons), lessons === 1 ? "lesson passed" : "lessons passed"],
          [Flame, `${days}`, "day streak"],
          [Target, `${best}`, "best streak"],
        ].map(([Icon, v, label]) => {
          const I = Icon as typeof Star;
          return (
            <div key={label as string} className="panel flex flex-col-reverse gap-1 p-4!">
              <dt className="flex items-center gap-1 text-xs tracking-wide text-ink-500 uppercase">
                <I size={14} className="text-accent-ink" aria-hidden /> {label as string}
              </dt>
              <dd className="font-display text-2xl font-black">{v as string}</dd>
            </div>
          );
        })}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="panel">
          <p className="eyebrow">Consistency</p>
          <h2 className="mt-1 text-xl font-extrabold">Your last 13 weeks</h2>
          <div
            className="mt-5 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-1"
            style={{ gridAutoColumns: "14px" }}
            aria-label={`Activity over the last 13 weeks: ${heat.filter((h) => h.level > 0).length} active days`}
            role="img"
          >
            {heat.map((h) => (
              <i key={h.d} className="heat block h-3.5 w-3.5 rounded-[4px]" data-level={h.level} title={`${h.d}: ${h.xp} points`} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-ink-500" aria-hidden>
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <i key={l} className="heat block h-3 w-3 rounded-[3px]" data-level={l} />
            ))}
            More
          </div>
        </section>

        <section className="panel" id="goal">
          <p className="eyebrow">Daily goal</p>
          <h2 className="mt-1 text-xl font-extrabold">Choose your pace</h2>
          <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Daily goal">
            {GOALS.map((g, gi) => {
              const active = progress.goal === g.xp;
              // One tab stop for the group; arrow keys move between goals.
              const chosen = GOALS.some((x) => x.xp === progress.goal) ? active : gi === 0;
              const pick = (x: number) => {
                setGoal(x);
                track("goal_set", { value: x });
              };
              return (
                <button
                  key={g.xp}
                  role="radio"
                  aria-checked={active}
                  tabIndex={chosen ? 0 : -1}
                  onClick={() => pick(g.xp)}
                  onKeyDown={(e) => {
                    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
                    if (!step) return;
                    e.preventDefault();
                    const to = (gi + step + GOALS.length) % GOALS.length;
                    pick(GOALS[to].xp);
                    (e.currentTarget.parentElement?.children[to] as HTMLElement | undefined)?.focus();
                  }}
                  className={`grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border px-4 text-start ${
                    active ? "border-2 border-primary bg-primary-soft" : "border-sand-300 bg-background"
                  }`}
                >
                  <Target size={20} className="text-primary" aria-hidden />
                  <span>
                    <strong className="block font-display">{g.label}</strong>
                    <small className="text-ink-500">{g.blurb}</small>
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    {g.xp} pts {active && <Check size={18} className="text-primary" aria-hidden />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">In progress</p>
          <h2 className="mt-1 text-xl font-extrabold">Your courses</h2>
          {courses.length === 0 ? (
            <p className="mt-3 text-ink-600">
              No lessons passed yet.{" "}
              <Link href="/learn" className="font-bold text-primary underline">
                Pick a language
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {courses.map(([code, units]) => {
                const l = getLanguage(code)!;
                const pct = Math.round((units.length / UNITS.length) * 100);
                return (
                  <li key={code}>
                    <Link href={`/learn/${code}`} className="block">
                      <span className="mb-1.5 flex justify-between text-sm">
                        <strong className="font-display">
                          {l.name}
                          {l.nativeName !== l.name && (
                            <>
                              {" "}
                              <span dir={l.dir} lang={l.speech} className="font-normal text-ink-500">
                                {l.nativeName}
                              </span>
                            </>
                          )}
                        </strong>
                        <small className="text-ink-500">
                          {units.length}/{UNITS.length} lessons
                        </small>
                      </span>
                      <span className="block h-2.5 overflow-hidden rounded-full bg-sand-200" aria-hidden>
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel">
          <p className="eyebrow">Achievements</p>
          <h2 className="mt-1 text-xl font-extrabold">
            {earned.filter((b) => b.earned).length} of {earned.length} badges
          </h2>
          <ul className="mt-4 grid grid-cols-3 gap-2">
            {earned.map((b) => (
              <li
                key={b.id}
                className="flex flex-col items-center rounded-2xl bg-sand-100 px-1 py-3 text-center"
                title={b.how}
              >
                <span className={`text-2xl ${b.earned ? "" : "opacity-35 grayscale"}`} aria-hidden>
                  {b.icon}
                </span>
                <strong className={`mt-1 text-xs leading-tight ${b.earned ? "" : "text-ink-600"}`}>{b.title}</strong>
                <small className="text-[11px] leading-tight text-ink-600">
                  {b.earned ? "Earned" : b.how}
                  <span className="sr-only">{b.earned ? "" : " — not yet earned"}</span>
                </small>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {account && <AccountActions admin={account.admin} />}
    </div>
  );
}

function AccountActions({ admin }: { admin: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  function cancel() {
    setConfirming(false);
    setError(null);
    // The dialog (and the focus inside it) is gone; go back to where it opened.
    requestAnimationFrame(() => deleteButton.current?.focus());
  }
  return (
    <section className="flex flex-col items-center gap-4 border-t border-sand-300 pt-6">
      {admin && (
        <Link href="/admin" className="btn-secondary">
          <BarChart3 size={18} aria-hidden /> Owner dashboard
        </Link>
      )}
      <button onClick={() => void logOut()} className="font-bold text-danger">
        Log out
      </button>
      {!confirming ? (
        <button ref={deleteButton} onClick={() => setConfirming(true)} className="text-sm text-ink-500 underline">
          Delete my account
        </button>
      ) : (
        <div
          role="group"
          aria-labelledby="del-title"
          className="max-w-md rounded-2xl border-2 border-danger bg-danger-soft p-4 text-center"
          onKeyDown={(e) => {
            if (e.key === "Escape") cancel();
          }}
        >
          <p id="del-title" className="font-bold">
            Delete your account and all saved progress? This can&apos;t be undone.
          </p>
          {error && (
            <p role="alert" className="mt-2 font-bold text-danger">
              {error}
            </p>
          )}
          <div className="mt-3 flex justify-center gap-3">
            <button onClick={cancel} className="btn-secondary" autoFocus>
              Keep it
            </button>
            <button
              onClick={async () => {
                const r = await deleteAccount();
                if (!r.ok) setError(r.error ?? "Something went wrong.");
              }}
              className="inline-flex min-h-12 items-center rounded-2xl bg-danger px-5 font-display font-extrabold text-on-danger"
            >
              Delete forever
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
