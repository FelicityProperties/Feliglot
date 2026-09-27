"use client";

import { useState } from "react";
import Link from "next/link";
import { UNITS } from "@/lib/curriculum";
import { getLanguage } from "@/lib/languages";
import { logIn, logOut, signUp, streak, useAccount, useProgress } from "@/lib/store";

export default function AccountPanel() {
  const account = useAccount();
  const progress = useProgress();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (account.status === "loading") return <p className="text-ink-600">Loading…</p>;
  if (account.status === "off") {
    return <p className="text-ink-600">Accounts aren&apos;t switched on yet. Your progress is saved on this device.</p>;
  }

  const lessons = Object.values(progress.done).reduce((n, u) => n + u.length, 0);
  const courses = Object.entries(progress.done).filter(([, u]) => u.length > 0);

  if (account.status === "signed-in") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-sand-200 bg-white p-6">
          <p className="text-sm text-ink-500">Signed in as</p>
          <p className="text-lg font-semibold text-ink-900">{account.email}</p>
          <p className="mt-2 text-sm text-ink-600" role="status">
            {account.saving
              ? "Saving…"
              : account.saveFailed
                ? "Couldn't save just now — we'll try again with your next lesson."
                : "✓ Your progress is saved to your account and follows you to any device."}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            [String(streak(progress.days)), "day streak"],
            [String(progress.xp), "points"],
            [String(lessons), lessons === 1 ? "lesson passed" : "lessons passed"],
          ].map(([n, label]) => (
            <div key={label} className="rounded-2xl border border-sand-200 bg-white p-4">
              <p className="text-2xl font-bold text-ink-900">{n}</p>
              <p className="text-sm text-ink-600">{label}</p>
            </div>
          ))}
        </div>
        {courses.length > 0 && (
          <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white">
            {courses.map(([code, units]) => {
              const l = getLanguage(code);
              if (!l) return null;
              return (
                <li key={code}>
                  <Link href={`/learn/${code}`} className="flex items-center justify-between p-4 hover:bg-sand-50">
                    <span className="font-medium text-ink-900">{l.name}</span>
                    <span className="text-sm text-ink-500">
                      {units.length} of {UNITS.length} lessons
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <button onClick={() => void logOut()} className="btn-secondary">
          Log out
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = mode === "signup" ? await signUp(email, password) : await logIn(email, password);
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Something went wrong.");
    else setPassword("");
  }

  return (
    <div className="max-w-md">
      <div className="mb-6 flex gap-2" role="group" aria-label="Sign up or log in">
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
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === m ? "bg-ink-900 text-white" : "bg-sand-100 text-ink-700 hover:bg-sand-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-ink-600">
        {mode === "signup"
          ? lessons > 0
            ? `Save your ${lessons} ${lessons === 1 ? "lesson" : "lessons"} and ${progress.xp} points, and keep learning on any device.`
            : "Save your progress and keep learning on any device."
          : "Welcome back. Anything you did on this device is added to your account."}
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-base outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-hint"
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-base outline-none focus:border-teal-600"
          />
          <p id="password-hint" className="mt-1 text-xs text-ink-500">
            At least 8 characters.
          </p>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {busy ? "One moment…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}
