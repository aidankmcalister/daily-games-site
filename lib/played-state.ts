const COOKIE_NAME = "daily-games-played";

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  document.cookie = `${name}=${value}; expires=${tomorrow.toUTCString()}; path=/`;
}

export function getPlayedIds(): Set<string> {
  const cookieValue = getCookie(COOKIE_NAME);
  if (!cookieValue) return new Set();

  try {
    const { date, ids } = JSON.parse(decodeURIComponent(cookieValue));
    if (date !== getTodayDateString()) return new Set();
    return new Set(ids as string[]);
  } catch {
    return new Set();
  }
}

export function savePlayedIds(ids: Set<string>): void {
  const value = JSON.stringify({
    date: getTodayDateString(),
    ids: [...ids],
  });
  setCookie(COOKIE_NAME, encodeURIComponent(value));
}

export function isNewDay(): boolean {
  const cookieValue = getCookie(COOKIE_NAME);
  if (!cookieValue) return false;
  try {
    const { date } = JSON.parse(decodeURIComponent(cookieValue));
    return date !== getTodayDateString();
  } catch {
    return true;
  }
}
