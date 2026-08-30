/** Derive a display name + avatar initials from an email address. */
export function userFromEmail(email: string | null) {
  if (!email) {
    return { name: 'Guest', handle: 'Not signed in', initials: 'G' };
  }
  const [local] = email.split('@');
  const parts = local.split(/[._-]+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : local.slice(0, 2).toUpperCase();
  const name = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
  return { name: name || local, handle: email, initials };
}
