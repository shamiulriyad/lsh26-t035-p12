/**
 * Guest mode — use the app with local sample data, no account.
 *
 * A lightweight cookie tells the middleware to let the request through without
 * a Supabase session. Nothing is persisted remotely while in guest mode; the
 * ledger runs on the built-in benchmark dataset. Signing in clears the flag.
 */
export const GUEST_COOKIE = 'takarunway_guest';

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Mark this browser as a guest. Client-only. */
export function enterGuestMode(): void {
  document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

/** Drop the guest flag (called on sign-in, or when leaving guest mode). Client-only. */
export function exitGuestMode(): void {
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/** Whether the guest cookie is set in this browser. Client-only. */
export function isGuest(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c === `${GUEST_COOKIE}=1`);
}
