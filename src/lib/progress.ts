// Progress lives in the learner's own browser for now — no sign-up needed.
// Moving it to the database (accounts, streaks across devices) is the next step.

const KEY = "feliglot:done";

export function getDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markDone(slug: string) {
  try {
    const done = new Set(getDone());
    done.add(slug);
    localStorage.setItem(KEY, JSON.stringify([...done]));
    window.dispatchEvent(new Event("feliglot:progress"));
  } catch {
    // Private mode or blocked storage: progress just isn't remembered.
  }
}

export function subscribeProgress(cb: () => void) {
  window.addEventListener("feliglot:progress", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("feliglot:progress", cb);
    window.removeEventListener("storage", cb);
  };
}

// Stable snapshot for useSyncExternalStore: a string, compared by value.
export function doneSnapshot(): string {
  return getDone().sort().join(",");
}
