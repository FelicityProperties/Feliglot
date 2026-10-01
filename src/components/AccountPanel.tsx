"use client";

import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, Check, Flame, Star, Target, Trophy } from "lucide-react";
import { badges } from "@/lib/achievements";
import { UNITS } from "@/lib/curriculum";
import { languageName, useT } from "@/lib/i18n";
import { getLanguage } from "@/lib/languages";
import { GOALS, addDays } from "@/lib/progress";
import { bestStreak, deleteAccount, logIn, logOut, setGoal, signUp, streak, useAccount, useProgress, useToday, type Account } from "@/lib/store";
import { track } from "@/lib/track";
import type { UiKey } from "@/lib/ui";
import Feli from "./Feli";

export default function AccountPanel() {
  const account = useAccount();
  const { t } = useT();
  if (account.status === "loading") return <p className="text-ink-600">{t("account.loading")}</p>;
  if (account.status === "off") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black">{t("account.off.title")}</h1>
          <p className="mt-2 text-ink-600">{t("account.off.body")}</p>
        </div>
        <Profile account={null} />
      </div>
    );
  }
  if (account.status === "signed-out") return <SignIn google={account.google} />;
  return <Profile account={account} />;
}

// ---------------------------------------------------------------------------

// A message written here (kept as its key, so it follows the language) or one sent back by the server (shown as is).
type Message = { key: UiKey } | string;

// The learner's language as a BCP 47 tag, for dates and numbers.
function useLocale() {
  const { t, lang } = useT();
  return { t, lang, tag: getLanguage(lang)?.speech ?? "en" };
}

// Fills "{name}" slots in translated text with elements (e.g. links).
function rich(text: string, parts: Record<string, React.ReactNode>) {
  return text.split(/\{(\w+)\}/).map((s, i) => <Fragment key={i}>{i % 2 ? (parts[s] ?? `{${s}}`) : s}</Fragment>);
}

function SignIn({ google }: { google: boolean }) {
  const params = useSearchParams();
  const progress = useProgress();
  const { t, tag } = useLocale();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Message | null>(params.get("error") === "google" ? { key: "account.signIn.googleFailed" } : null);
  const lessons = Object.values(progress.done).reduce((n, u) => n + u.length, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = mode === "signup" ? await signUp(email, password, name) : await logIn(email, password);
    setBusy(false);
    if (!r.ok) setError(r.error ?? { key: "account.somethingWrong" });
    else setPassword("");
  }

  return (
    <div className="-mx-4 -mt-6 grid overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-3xl sm:border sm:border-sand-300 lg:grid-cols-2">
      <section className="flex flex-col justify-between gap-6 bg-primary p-8 text-on-primary sm:p-12">
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] uppercase">
            {mode === "signup" ? t("account.signIn.eyebrowSignup") : t("account.signIn.eyebrowLogin")}
          </p>
          <h1 className="mt-3 text-4xl leading-none font-black sm:text-5xl">
            {t("account.signIn.headline")
              .split("\n")
              .map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
          </h1>
          <p className="mt-3 opacity-90">
            {lessons > 0
              ? t("account.signIn.saveProgress", {
                  lessons: t("account.signIn.lessonCount", { n: lessons }),
                  points: t("account.signIn.pointCount", { n: progress.xp, points: progress.xp.toLocaleString(tag) }),
                })
              : t("account.signIn.pitch")}
          </p>
        </div>
        <Feli size={180} className="self-center" decorative />
      </section>

      <section className="bg-background p-6 sm:p-10">
        <div className="mx-auto grid max-w-md gap-4">
          <div className="flex gap-2 rounded-2xl bg-sand-100 p-1" role="group" aria-label={t("account.signIn.modeGroup")}>
            {(
              [
                ["signup", t("account.signIn.createAccount")],
                ["login", t("account.signIn.logIn")],
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
                <GoogleLogo /> {t("account.signIn.google")}
              </a>
              <div className="flex items-center gap-3 text-xs text-ink-500">
                <span className="h-px flex-1 bg-sand-300" /> {t("account.signIn.orEmail")} <span className="h-px flex-1 bg-sand-300" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="grid gap-4">
            {mode === "signup" && (
              <Field id="name" label={t("account.signIn.firstName")}>
                <input id="name" autoComplete="given-name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </Field>
            )}
            <Field id="email" label={t("account.signIn.email")}>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </Field>
            <Field id="password" label={t("account.signIn.password")} hint={t("account.signIn.passwordHint")}>
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
                {typeof error === "string" ? error : t(error.key)}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">
              {busy ? t("account.signIn.busy") : mode === "signup" ? t("account.signIn.createAccount") : t("account.signIn.logIn")}{" "}
              <ArrowRight size={18} aria-hidden />
            </button>
          </form>
          <p className="text-center text-xs text-ink-500">
            {rich(t("account.signIn.agree"), {
              terms: (
                <Link href="/terms" className="underline">
                  {t("account.signIn.terms")}
                </Link>
              ),
              privacy: (
                <Link href="/privacy" className="underline">
                  {t("account.signIn.privacy")}
                </Link>
              ),
            })}
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
  const { t, lang, tag } = useLocale();
  const days = streak(progress.days);
  const best = bestStreak(progress.days);
  const lessons = Object.values(progress.done).reduce((n, u) => n + u.length, 0);
  const courses = Object.entries(progress.done).filter(([code, u]) => u.length > 0 && getLanguage(code));
  const earned = badges(progress, best);
  const joined = account?.joined ? new Date(account.joined).toLocaleDateString(tag, { month: "long", year: "numeric" }) : null;

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
          {account.name ? t("account.profile.welcomeNamed", { name: account.name }) : t("account.profile.welcome")}
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
            <p className="eyebrow">{t("account.profile.eyebrow")}</p>
            <h1 className="truncate text-3xl font-black">{account.name ?? account.email.split("@")[0]}</h1>
            <p className="truncate text-sm text-ink-500">
              {account.email}
              {joined ? ` · ${t("account.profile.learningSince", { date: joined })}` : ""} · {t("account.profile.courseCount", { n: courses.length })}
            </p>
          </div>
          <p className="text-sm text-ink-600" role="status">
            {account.saving ? t("account.profile.saving") : account.saveFailed ? t("account.profile.saveFailed") : t("account.profile.synced")}
          </p>
        </section>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [Star, progress.xp.toLocaleString(tag), t("account.stats.totalPoints")],
          [Trophy, lessons.toLocaleString(tag), t("account.stats.lessonsPassed", { n: lessons })],
          [Flame, days.toLocaleString(tag), t("account.stats.dayStreak", { n: days })],
          [Target, best.toLocaleString(tag), t("account.stats.bestStreak")],
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
          <p className="eyebrow">{t("account.heat.eyebrow")}</p>
          <h2 className="mt-1 text-xl font-extrabold">{t("account.heat.title")}</h2>
          <div
            className="mt-5 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-1"
            style={{ gridAutoColumns: "14px" }}
            aria-label={t("account.heat.label", { n: heat.filter((h) => h.level > 0).length })}
            role="img"
          >
            {heat.map((h) => (
              <i
                key={h.d}
                className="heat block h-3.5 w-3.5 rounded-[4px]"
                data-level={h.level}
                title={t("account.heat.day", { n: h.xp, date: h.d, points: h.xp.toLocaleString(tag) })}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-ink-500" aria-hidden>
            {t("account.heat.less")}
            {[0, 1, 2, 3, 4].map((l) => (
              <i key={l} className="heat block h-3 w-3 rounded-[3px]" data-level={l} />
            ))}
            {t("account.heat.more")}
          </div>
        </section>

        <section className="panel" id="goal">
          <p className="eyebrow">{t("account.goal.eyebrow")}</p>
          <h2 className="mt-1 text-xl font-extrabold">{t("account.goal.title")}</h2>
          <div className="mt-4 grid gap-2" role="radiogroup" aria-label={t("account.goal.group")}>
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
                    <strong className="block font-display">{t(`account.goal.${g.xp}.label`)}</strong>
                    <small className="text-ink-500">{t(`account.goal.${g.xp}.blurb`)}</small>
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    {t("account.goal.points", { n: g.xp.toLocaleString(tag) })} {active && <Check size={18} className="text-primary" aria-hidden />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">{t("account.courses.eyebrow")}</p>
          <h2 className="mt-1 text-xl font-extrabold">{t("account.courses.title")}</h2>
          {courses.length === 0 ? (
            <p className="mt-3 text-ink-600">
              {t("account.courses.none")}{" "}
              <Link href="/learn" className="font-bold text-primary underline">
                {t("account.courses.pick")}
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {courses.map(([code, units]) => {
                const l = getLanguage(code)!;
                const name = languageName(code, lang);
                const pct = Math.round((units.length / UNITS.length) * 100);
                return (
                  <li key={code}>
                    <Link href={`/learn/${code}`} className="block">
                      <span className="mb-1.5 flex justify-between text-sm">
                        <strong className="font-display">
                          {name}
                          {l.nativeName !== name && (
                            <>
                              {" "}
                              <span dir={l.dir} lang={l.speech} className="font-normal text-ink-500">
                                {l.nativeName}
                              </span>
                            </>
                          )}
                        </strong>
                        <small className="text-ink-500">
                          {t("account.courses.lessons", { n: UNITS.length, done: units.length })}
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
          <p className="eyebrow">{t("account.badges.eyebrow")}</p>
          <h2 className="mt-1 text-xl font-extrabold">
            {t("account.badges.count", { n: earned.length, earned: earned.filter((b) => b.earned).length })}
          </h2>
          <ul className="mt-4 grid grid-cols-3 gap-2">
            {earned.map((b) => (
              <li
                key={b.id}
                className="flex flex-col items-center rounded-2xl bg-sand-100 px-1 py-3 text-center"
                title={t(`account.badge.${b.id}.how` as UiKey)}
              >
                <span className={`text-2xl ${b.earned ? "" : "opacity-35 grayscale"}`} aria-hidden>
                  {b.icon}
                </span>
                <strong className={`mt-1 text-xs leading-tight ${b.earned ? "" : "text-ink-600"}`}>
                  {t(`account.badge.${b.id}.title` as UiKey)}
                </strong>
                <small className="text-[11px] leading-tight text-ink-600">
                  {b.earned ? t("account.badges.earned") : t(`account.badge.${b.id}.how` as UiKey)}
                  <span className="sr-only">{b.earned ? "" : t("account.badges.notEarned")}</span>
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
  const { t } = useT();
  const [error, setError] = useState<Message | null>(null);
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
          <BarChart3 size={18} aria-hidden /> {t("account.actions.dashboard")}
        </Link>
      )}
      <button onClick={() => void logOut()} className="font-bold text-danger">
        {t("account.actions.logOut")}
      </button>
      {!confirming ? (
        <button ref={deleteButton} onClick={() => setConfirming(true)} className="text-sm text-ink-500 underline">
          {t("account.actions.delete")}
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
            {t("account.actions.confirm")}
          </p>
          {error && (
            <p role="alert" className="mt-2 font-bold text-danger">
              {typeof error === "string" ? error : t(error.key)}
            </p>
          )}
          <div className="mt-3 flex justify-center gap-3">
            <button onClick={cancel} className="btn-secondary" autoFocus>
              {t("account.actions.keep")}
            </button>
            <button
              onClick={async () => {
                const r = await deleteAccount();
                if (!r.ok) setError(r.error ?? { key: "account.somethingWrong" });
              }}
              className="inline-flex min-h-12 items-center rounded-2xl bg-danger px-5 font-display font-extrabold text-on-danger"
            >
              {t("account.actions.deleteForever")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
